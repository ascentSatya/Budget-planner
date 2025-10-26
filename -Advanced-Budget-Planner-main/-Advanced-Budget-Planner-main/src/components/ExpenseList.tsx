import React, { useState } from 'react';
import { Category, Expense } from '../types/budget';
import { Calendar, Tag, RefreshCw, Search, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  expenses: Expense[];
  categories: Category[];
  onDeleteExpense: (id: string) => void;
  onUpdateExpense: (id: string, updates: Partial<Expense>) => void;
  onExport: () => void;
}

export const ExpenseList: React.FC<Props> = ({ 
  expenses, 
  categories, 
  onDeleteExpense,
  onUpdateExpense,
  onExport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
  };

  const filteredAndSortedExpenses = expenses
    .filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryName(expense.categoryId).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || expense.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return sortOrder === 'desc'
          ? b.amount - a.amount
          : a.amount - b.amount;
      }
    });

  const handleSort = (newSortBy: 'date' | 'amount') => {
    if (sortBy === newSortBy) {
      setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Recent Expenses</h3>
        <button
          onClick={onExport}
          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleSort('date')}
            className={`px-3 py-1 rounded-md ${
              sortBy === 'date' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Sort by Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('amount')}
            className={`px-3 py-1 rounded-md ${
              sortBy === 'amount' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Sort by Amount {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredAndSortedExpenses.map(expense => (
          <div
            key={expense.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="font-medium">{expense.description || 'Unnamed Expense'}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(expense.date), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    {getCategoryName(expense.categoryId)}
                  </div>
                  {expense.isRecurring && (
                    <div className="flex items-center text-blue-600">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      {expense.recurringInterval}
                    </div>
                  )}
                </div>
                {expense.tags && expense.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {expense.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {expense.notes && (
                  <p className="text-sm text-gray-500">{expense.notes}</p>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span className="font-semibold text-lg">
                  ${expense.amount.toFixed(2)}
                </span>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => onDeleteExpense(expense.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      // Implement edit functionality
                      // This could open a modal or expand the row with a form
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredAndSortedExpenses.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No expenses found
          </p>
        )}
      </div>
    </div>
  );
};