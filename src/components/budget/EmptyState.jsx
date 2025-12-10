// src/components/budget/EmptyState.jsx
import { PiggyBank, Plus, Sparkles } from 'lucide-react';

const EmptyState = ({ onCreateBudget, onGetRecommendations }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-12 text-center">
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
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
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onCreateBudget}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Budget
          </button>
          
          <button
            onClick={onGetRecommendations}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            <Sparkles className="w-5 h-5" />
            Get Recommendations
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 text-left">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900 mb-1">Track Spending</h3>
            <p className="text-sm text-gray-600">See exactly where your money goes</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-1">Stay On Track</h3>
            <p className="text-sm text-gray-600">Get alerts before overspending</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">💡</div>
            <h3 className="font-semibold text-gray-900 mb-1">AI Insights</h3>
            <p className="text-sm text-gray-600">Get personalized recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;