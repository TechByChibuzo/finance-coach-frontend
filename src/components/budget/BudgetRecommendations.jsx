import { Loader2, Plus } from 'lucide-react';
import { useBudgetRecommendations } from '../../hooks/useBudgets';
import { formatCurrency } from '../../utils/helpers';

/**
 * Suggested budgets for categories the user spends in but hasn't budgeted yet.
 * "Other" is left out: it lumps unrelated spending together and isn't a category you can budget.
 */
export default function BudgetRecommendations({ onCreateFromRecommendation, budgetedCategories = [] }) {
  const { data: recommendations, isLoading, isError } = useBudgetRecommendations();

  if (isLoading) {
    return (
      <div className="card flex items-center justify-center py-8 gap-2">
        <Loader2 className="w-5 h-5 text-primary-600 animate-spin" aria-hidden />
        <span className="text-sm text-gray-500">Looking at your recent spending…</span>
      </div>
    );
  }

  const budgeted = new Set(budgetedCategories);
  const suggestions = Object.entries(recommendations || {})
    .filter(([category]) => category !== 'Other' && !budgeted.has(category))
    .sort(([, a], [, b]) => b - a);

  if (isError || suggestions.length === 0) {
    return null;
  }

  return (
    <section className="card">
      <h2 className="text-base font-bold text-gray-900">Suggested budgets</h2>
      <p className="text-sm text-gray-500 mt-1 mb-4">
        Based on your average monthly spending over the last 3 months, plus 10% headroom.
      </p>
      <ul className="divide-y divide-gray-100">
        {suggestions.map(([category, amount]) => (
          <li key={category} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{category}</p>
              <p className="text-xs text-gray-500">{formatCurrency(amount, false)} a month</p>
            </div>
            <button
              onClick={() => onCreateFromRecommendation({ category, amount })}
              className="btn-secondary flex items-center gap-1.5 text-sm shrink-0"
              aria-label={`Add a ${formatCurrency(amount, false)} budget for ${category}`}
            >
              <Plus className="w-4 h-4" aria-hidden />
              Add
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
