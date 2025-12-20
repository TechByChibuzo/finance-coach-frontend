// src/components/budget/BudgetRecommendations.jsx
import { Lightbulb, TrendingUp, Loader2 } from 'lucide-react';
import { useBudgetRecommendations } from '../../hooks/useBudgets';
import { formatCurrency} from '../../utils/helpers';


const BudgetRecommendations = ({ onCreateFromRecommendation }) => {
  const { data: recommendations, isLoading, isError } = useBudgetRecommendations();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading recommendations...</span>
      </div>
    );
  }

  if (isError || !recommendations || Object.keys(recommendations).length === 0) {
    return null;
  }

  return (
    <div className="bg-linear-to-bl from-blue-50 to-indigo-50 rounded-xl shadow-md p-6 border border-blue-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Lightbulb className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Budget Recommendations</h3>
          <p className="text-sm text-gray-600">Based on your last 3 months of spending</p>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(recommendations).map(([category, amount]) => (
          <div
            key={category}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-700">{category}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(amount)}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            
            <button
              onClick={() => onCreateFromRecommendation({ category, amount })}
              className="w-full mt-3 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
            >
              Use this budget
            </button>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> These suggestions include a 10% buffer above your average spending
        </p>
      </div>
    </div>
  );
};

export default BudgetRecommendations;