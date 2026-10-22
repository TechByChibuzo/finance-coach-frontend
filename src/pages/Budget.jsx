import { useState } from 'react';
import { Plus, Copy } from 'lucide-react';
import { startOfMonth } from 'date-fns';
import { toast } from 'react-hot-toast';

import Layout from '../components/layout/Layout';
import MonthSelector from '../components/budget/MonthSelector';
import BudgetOverview from '../components/budget/BudgetOverview';
import BudgetCard from '../components/budget/BudgetCard';
import BudgetModal from '../components/budget/BudgetModal';
import BudgetRecommendations from '../components/budget/BudgetRecommendations';
import EmptyState from '../components/budget/EmptyState';
import BudgetSkeleton from '../components/budget/BudgetSkeleton';
import ErrorMessage from '../components/common/ErrorMessage';

import {
  useBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
  useCopyPreviousBudgets,
} from '../hooks/useBudgets';

export default function Budget() {
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [recommendationData, setRecommendationData] = useState(null);

  const { data: budgetData, isLoading, error, refetch } = useBudgets(selectedMonth);

  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();
  const copyPrevious = useCopyPreviousBudgets();

  const handleCreateBudget = () => {
    setEditingBudget(null);
    setRecommendationData(null);
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setRecommendationData(null);
    setIsModalOpen(true);
  };

  const handleSubmitBudget = async (budgetFormData) => {
    try {
      if (editingBudget) {
        await updateBudget.mutateAsync(budgetFormData);
        toast.success('Budget updated');
      } else {
        await createBudget.mutateAsync(budgetFormData);
        toast.success('Budget created');
      }
      setIsModalOpen(false);
      setEditingBudget(null);
      setRecommendationData(null);
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Couldn't save the budget. Try again.");
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!confirm('Delete this budget? Your transactions stay as they are.')) return;
    try {
      await deleteBudget.mutateAsync(budgetId);
      toast.success('Budget deleted');
    } catch {
      toast.error("Couldn't delete the budget. Try again.");
    }
  };

  const handleCopyPrevious = async () => {
    try {
      await copyPrevious.mutateAsync();
      toast.success("Copied last month's budgets");
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to copy budgets');
    }
  };

  const handleCreateFromRecommendation = ({ category, amount }) => {
    setEditingBudget(null);
    setRecommendationData({ category, amount });
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <BudgetSkeleton />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorMessage
          message={error?.message || 'Failed to load budgets'}
          onRetry={refetch}
          type="error"
        />
      </Layout>
    );
  }

  const hasBudgets = budgetData?.budgets && budgetData.budgets.length > 0;

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex items-end justify-between gap-4">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Budgets</h1>
          <div className="flex gap-2">
            {hasBudgets && (
              <button
                onClick={handleCopyPrevious}
                disabled={copyPrevious.isPending}
                className="btn-secondary flex items-center gap-2 text-sm"
                title="Copy last month's budgets into this month"
              >
                <Copy className="w-4 h-4" aria-hidden />
                <span className="hidden sm:inline">Copy last month</span>
              </button>
            )}
            {hasBudgets && (
              <button onClick={handleCreateBudget} className="btn-primary flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" aria-hidden />
                <span>New budget</span>
              </button>
            )}
          </div>
        </header>

        <MonthSelector currentMonth={selectedMonth} onMonthChange={setSelectedMonth} />

        {!hasBudgets ? (
          <EmptyState
            onCreateBudget={handleCreateBudget}
            onCreateFromRecommendation={handleCreateFromRecommendation}
          />
        ) : (
          <>
            <BudgetOverview summary={budgetData} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgetData.budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onEdit={handleEditBudget}
                  onDelete={handleDeleteBudget}
                />
              ))}
            </div>

            <BudgetRecommendations
              onCreateFromRecommendation={handleCreateFromRecommendation}
              budgetedCategories={budgetData.budgets.map((b) => b.category)}
            />
          </>
        )}

        {isModalOpen && (
          <BudgetModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingBudget(null);
              setRecommendationData(null);
            }}
            onSubmit={handleSubmitBudget}
            editBudget={editingBudget}
            recommendationData={recommendationData}
            currentMonth={selectedMonth}
          />
        )}
      </div>
    </Layout>
  );
}
