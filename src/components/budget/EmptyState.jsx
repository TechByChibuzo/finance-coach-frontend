import { Plus } from 'lucide-react';
import BudgetRecommendations from './BudgetRecommendations';
import Illustration from '../common/Illustration';

/**
 * Shown before the first budget of the month: one clear action, with suggested
 * amounts from the user's own spending right underneath so they can start in one tap.
 */
export default function EmptyState({ onCreateBudget, onCreateFromRecommendation }) {
  return (
    <div className="space-y-6">
      <section className="card p-6 sm:p-8 sm:flex sm:items-center sm:gap-8">
        <Illustration name="budgets" className="mb-4 h-28 w-40 shrink-0 sm:order-2 sm:mb-0 sm:ml-auto" />
        <div>
        <h2 className="text-xl font-bold text-gray-900">Set your first budget</h2>
        <p className="mt-2 text-sm text-gray-600 max-w-lg leading-relaxed">
          Pick a category and a monthly amount. Each month we compare it with what you actually spend,
          so you can see what's left before you run out.
        </p>
        <button onClick={onCreateBudget} className="btn-primary mt-5 inline-flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" aria-hidden />
          New budget
        </button>
        </div>
      </section>

      <BudgetRecommendations onCreateFromRecommendation={onCreateFromRecommendation} />
    </div>
  );
}
