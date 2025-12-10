// src/components/budget/EmptyState.jsx - POLISHED VERSION
import { PiggyBank, Plus, Sparkles } from 'lucide-react';

export default function EmptyState({ onCreateBudget, onGetRecommendations }) {
  return (
    <div className="card text-center py-12 fade-in">
      <div className="max-w-md mx-auto">
        {/* Icon with bounce animation */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6 animate-bounce">
          <PiggyBank className="w-10 h-10 text-blue-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          No budgets yet
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          Create your first budget to track spending and reach your financial goals. 
          Budgets help you stay on track and make better financial decisions.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <button
            onClick={onCreateBudget}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Budget
          </button>
          
          <button
            onClick={onGetRecommendations}
            className="btn-secondary inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Get Recommendations
          </button>
        </div>

        {/* Info Cards with staggered fade-in */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div 
            className="p-4 bg-gray-50 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1 fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900 mb-1">Track Spending</h3>
            <p className="text-sm text-gray-600">See exactly where your money goes</p>
          </div>
          
          <div 
            className="p-4 bg-gray-50 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1 fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-1">Stay On Track</h3>
            <p className="text-sm text-gray-600">Get alerts before overspending</p>
          </div>
          
          <div 
            className="p-4 bg-gray-50 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1 fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="text-2xl mb-2">💡</div>
            <h3 className="font-semibold text-gray-900 mb-1">AI Insights</h3>
            <p className="text-sm text-gray-600">Get personalized recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
}