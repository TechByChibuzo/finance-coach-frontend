import { Lightbulb, TrendingUp, Loader2 } from 'lucide-react';
import { useBudgetRecommendations } from '../../hooks/useBudgets';
import { formatCurrency } from '../../utils/helpers';

export default function BudgetRecommendations({ onCreateFromRecommendation }) {
  const { data: recommendations, isLoading, isError } = useBudgetRecommendations();

  if (isLoading) {
    return (
      <div className="card flex items-center justify-center py-8 gap-2">
        <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
        <span className="text-sm text-gray-500">Loading recommendations...</span>
      </div>
    );
  }

  if (isError || !recommendations || Object.keys(recommendations).length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-linear-to-br from-blue-50 to-indigo-50 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">Budget Recommendations</h3>
          <p className="text-xs text-gray-400 mt-0.5">Based on your last 3 months of spending</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(recommendations).map(([category, amount]) => (
          <div
            key={category}
            className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">{category}</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(amount)}</p>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            </div>
            <button
              onClick={() => onCreateFromRecommendation({ category, amount })}
              className="mt-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Use this budget →
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 p-3 bg-blue-100/60 rounded-lg">
        <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> These suggestions include a 10% buffer above your average spending
        </p>
      </div>
    </div>
  );
}
