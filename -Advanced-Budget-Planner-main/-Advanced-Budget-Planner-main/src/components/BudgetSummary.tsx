import React from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import { DollarSign, Wallet, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { Budget, BudgetAnalytics } from '../types/budget';
import { format } from 'date-fns';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

interface Props {
  budget: Budget;
  analytics: BudgetAnalytics;
}

export const BudgetSummary: React.FC<Props> = ({ budget, analytics }) => {
  const pieData = {
    labels: budget.categories.map(cat => cat.name),
    datasets: [{
      data: analytics.categoryBreakdown.map(cat => cat.spent),
      backgroundColor: budget.categories.map(cat => cat.color),
      borderWidth: 1
    }]
  };

  const trendData = {
    labels: analytics.monthlyTrend.map(trend => format(new Date(trend.month), 'MMM yyyy')),
    datasets: [{
      label: 'Monthly Spending',
      data: analytics.monthlyTrend.map(trend => trend.totalSpent),
      borderColor: '#4F46E5',
      tension: 0.4
    }]
  };

  const renderAlert = (message: string, type: 'warning' | 'danger' | 'success') => {
    const colors = {
      warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      danger: 'bg-red-50 text-red-800 border-red-200',
      success: 'bg-green-50 text-green-800 border-green-200'
    };

    return (
      <div className={`flex items-center p-3 rounded-lg border ${colors[type]}`}>
        <AlertTriangle className="w-5 h-5 mr-2" />
        <span className="text-sm">{message}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Total Budget</h3>
              <p className="text-2xl font-bold">${budget.totalBudget}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Remaining</h3>
              <p className="text-2xl font-bold">${analytics.remainingBudget}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Savings Progress</h3>
              <p className="text-2xl font-bold">{analytics.savingsProgress.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Projected Savings</h3>
              <p className="text-2xl font-bold">${analytics.projectedSavings}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Spending Breakdown</h3>
          <Pie data={pieData} options={{ responsive: true }} />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Spending Trends</h3>
          <Line data={trendData} options={{ responsive: true }} />
        </div>
      </div>

      <div className="space-y-3">
        {analytics.categoryBreakdown.map(cat => {
          const category = budget.categories.find(c => c.id === cat.categoryId);
          if (cat.percentage > 90) {
            return renderAlert(
              `${category?.name} category has reached ${cat.percentage.toFixed(1)}% of its budget`,
              'danger'
            );
          }
          return null;
        })}
        
        {analytics.savingsProgress < 50 && (
          renderAlert('You are behind on your savings goal for this month', 'warning')
        )}
      </div>
    </div>
  );
};