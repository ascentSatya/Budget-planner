import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Budget, Category, Expense, BudgetAnalytics, CategoryAnalytics, MonthlyTrend } from '../types/budget';

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Housing', amount: 1000, color: '#FF6B6B', icon: 'home' },
  { id: '2', name: 'Food', amount: 400, color: '#4ECDC4', icon: 'utensils' },
  { id: '3', name: 'Transportation', amount: 200, color: '#45B7D1', icon: 'car' },
  { id: '4', name: 'Entertainment', amount: 200, color: '#96CEB4', icon: 'tv' },
  { id: '5', name: 'Utilities', amount: 200, color: '#FFEEAD', icon: 'zap' }
];

const INITIAL_BUDGET: Budget = {
  totalBudget: 2000,
  categories: DEFAULT_CATEGORIES,
  expenses: [],
  savingsGoal: 500,
  monthlyIncome: 3000,
  startDate: format(new Date(), 'yyyy-MM-dd'),
  cycleType: 'monthly',
  alerts: [],
  customCategories: [] // Explicitly initialize as an empty array
};

export const useBudget = () => {
  const [budget, setBudget] = useState<Budget>(() => {
    const saved = localStorage.getItem('budget');
    if (saved) {
      const parsedBudget = JSON.parse(saved);
      // Ensure customCategories exists and is an array
      return {
        ...parsedBudget,
        customCategories: Array.isArray(parsedBudget.customCategories) ? parsedBudget.customCategories : []
      };
    }
    return INITIAL_BUDGET;
  });

  useEffect(() => {
    localStorage.setItem('budget', JSON.stringify(budget));
  }, [budget]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: crypto.randomUUID() };
    setBudget(prev => ({
      ...prev,
      expenses: [...prev.expenses, newExpense]
    }));
    checkBudgetAlerts(newExpense);
  };

  const updateCategory = (categoryId: string, updates: Partial<Category>) => {
    setBudget(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId ? { ...cat, ...updates } : cat
      )
    }));
  };

  const addCustomCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: crypto.randomUUID(), isCustom: true };
    setBudget(prev => ({
      ...prev,
      customCategories: [...prev.customCategories, newCategory]
    }));
  };

  const deleteExpense = (expenseId: string) => {
    setBudget(prev => ({
      ...prev,
      expenses: prev.expenses.filter(exp => exp.id !== expenseId)
    }));
  };

  const updateExpense = (expenseId: string, updates: Partial<Expense>) => {
    setBudget(prev => ({
      ...prev,
      expenses: prev.expenses.map(exp =>
        exp.id === expenseId ? { ...exp, ...updates } : exp
      )
    }));
  };

  const addBudgetAlert = (alert: Omit<BudgetAlert, 'id'>) => {
    const newAlert = { ...alert, id: crypto.randomUUID(), isActive: true };
    setBudget(prev => ({
      ...prev,
      alerts: [...prev.alerts, newAlert]
    }));
  };

  const toggleAlert = (alertId: string) => {
    setBudget(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
      )
    }));
  };

  const checkBudgetAlerts = (newExpense: Expense) => {
    const analytics = getBudgetAnalytics();
    
    budget.alerts.forEach(alert => {
      if (!alert.isActive) return;

      switch (alert.type) {
        case 'overspending':
          if (analytics.totalSpent > budget.totalBudget * (alert.threshold / 100)) {
            notifyUser(alert.message);
          }
          break;
        case 'categoryLimit':
          if (alert.categoryId === newExpense.categoryId) {
            const categoryAnalytics = analytics.categoryBreakdown
              .find(cat => cat.categoryId === alert.categoryId);
            if (categoryAnalytics && categoryAnalytics.percentage > alert.threshold) {
              notifyUser(alert.message);
            }
          }
          break;
        case 'savingsGoal':
          if (analytics.savingsProgress < alert.threshold) {
            notifyUser(alert.message);
          }
          break;
      }
    });
  };

  const notifyUser = (message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Budget Alert', { body: message });
    }
  };

  const getCurrentCycleExpenses = useCallback(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    return budget.expenses.filter(expense => 
      isWithinInterval(new Date(expense.date), { start, end })
    );
  }, [budget.expenses]);

  const getBudgetAnalytics = useCallback((): BudgetAnalytics => {
    const currentExpenses = getCurrentCycleExpenses();
    const totalSpent = currentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remainingBudget = budget.totalBudget - totalSpent;
    const savingsProgress = (remainingBudget / budget.savingsGoal) * 100;

    const categoryBreakdown: CategoryAnalytics[] = budget.categories.map(category => {
      const spent = currentExpenses
        .filter(exp => exp.categoryId === category.id)
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      return {
        categoryId: category.id,
        spent,
        budget: category.amount,
        percentage: (spent / category.amount) * 100,
        trend: 'stable' // Calculate trend based on historical data
      };
    });

    // Calculate monthly trends
    const monthlyTrend: MonthlyTrend[] = []; // Implement monthly trend calculation

    return {
      totalSpent,
      remainingBudget,
      savingsProgress,
      categoryBreakdown,
      monthlyTrend,
      projectedSavings: remainingBudget // Implement proper projection calculation
    };
  }, [budget, getCurrentCycleExpenses]);

  const exportBudgetData = () => {
    const data = {
      budget,
      analytics: getBudgetAnalytics(),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    budget,
    addExpense,
    updateCategory,
    addCustomCategory,
    deleteExpense,
    updateExpense,
    addBudgetAlert,
    toggleAlert,
    getBudgetAnalytics,
    exportBudgetData,
    getCurrentCycleExpenses
  };
};