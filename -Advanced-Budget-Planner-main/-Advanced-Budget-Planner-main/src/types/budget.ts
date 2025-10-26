export interface Category {
  id: string;
  name: string;
  amount: number;
  color: string;
  icon?: string;
  isCustom?: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  isRecurring?: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
  notes?: string;
}

export interface Budget {
  totalBudget: number;
  categories: Category[];
  expenses: Expense[];
  savingsGoal: number;
  monthlyIncome?: number;
  startDate: string;
  cycleType: 'monthly' | 'weekly' | 'custom';
  cycleDuration?: number;
  alerts: BudgetAlert[];
  customCategories: Category[];
}

export interface BudgetAlert {
  id: string;
  type: 'overspending' | 'categoryLimit' | 'savingsGoal' | 'custom';
  threshold: number;
  categoryId?: string;
  message: string;
  isActive: boolean;
}

export interface BudgetAnalytics {
  totalSpent: number;
  remainingBudget: number;
  savingsProgress: number;
  categoryBreakdown: CategoryAnalytics[];
  monthlyTrend: MonthlyTrend[];
  projectedSavings: number;
}

export interface CategoryAnalytics {
  categoryId: string;
  spent: number;
  budget: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface MonthlyTrend {
  month: string;
  totalSpent: number;
  categoriesSpent: Record<string, number>;
}