import React from 'react';
import { BudgetSummary } from './components/BudgetSummary';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { useBudget } from './hooks/useBudget';
import { PiggyBank } from 'lucide-react';

function App() {
  const { 
    budget,
    addExpense,
    deleteExpense,
    updateExpense,
    getBudgetAnalytics,
    exportBudgetData
  } = useBudget();

  const analytics = getBudgetAnalytics();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PiggyBank className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Budget Planner</h1>
            </div>
            <div className="text-sm text-gray-500">
              Current Budget Cycle: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <BudgetSummary
            budget={budget}
            analytics={analytics}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpenseForm
              categories={[...budget.categories, ...budget.customCategories]}
              onAddExpense={addExpense}
            />
            <ExpenseList
              expenses={budget.expenses}
              categories={[...budget.categories, ...budget.customCategories]}
              onDeleteExpense={deleteExpense}
              onUpdateExpense={updateExpense}
              onExport={exportBudgetData}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;