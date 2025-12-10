// src/pages/Budget.jsx
import { useState } from 'react';
import { Plus, RefreshCw, Copy, Loader2 } from 'lucide-react';
import { startOfMonth } from 'date-fns';
import { toast } from 'react-hot-toast';

// Components
import MonthSelector from '../components/budget/MonthSelector';
import BudgetOverview from '../components/budget/BudgetOverview';
import BudgetCard from '../components/budget/BudgetCard';
import BudgetModal from '../components/budget/BudgetModal';
import BudgetRecommendations from '../components/budget/BudgetRecommendations';
import EmptyState from '../components/budget/EmptyState';

// Hooks
import {
  useBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
  useRefreshBudgetSpending,
  useCopyPreviousBudgets,
} from '../hooks/useBudgets';

const Budget = () => {
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Queries
  const { data: budgetData, isLoading } = useBudgets(selectedMonth);

  // Mutations
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();
  const refreshSpending = useRefreshBudgetSpending();
  const copyPrevious = useCopyPreviousBudgets();

  // Handlers
  const handleCreateBudget = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleSubmitBudget = async (budgetFormData) => {
    try {
      if (editingBudget) {
        await updateBudget.mutateAsync(budgetFormData);
        toast.success('Budget updated successfully!');
      } else {
        await createBudget.mutateAsync(budgetFormData);
        toast.success('Budget created successfully!');
      }
      setIsModalOpen(false);
      setEditingBudget(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save budget');
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
      await deleteBudget.mutateAsync(budgetId);
      toast.success('Budget deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const handleRefreshSpending = async () => {
    try {
      await refreshSpending.mutateAsync(selectedMonth);
      toast.success('Budget spending refreshed!');
    } catch (error) {
      toast.error('Failed to refresh spending');
    }
  };

  const handleCopyPrevious = async () => {
    try {
      await copyPrevious.mutateAsync();
      toast.success('Budgets copied from previous month!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to copy budgets');
    }
  };

  const handleCreateFromRecommendation = ({ category, amount }) => {
    setEditingBudget(null);
    setIsModalOpen(true);
    // The modal will use currentMonth by default
    // We can enhance this by pre-filling the modal with recommendation data
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const hasBudgets = budgetData?.budgets && budgetData.budgets.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        {/* Title & Month Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <MonthSelector currentMonth={selectedMonth} onMonthChange={setSelectedMonth} />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {hasBudgets && (
            <>
              <button
                onClick={handleRefreshSpending}
                disabled={refreshSpending.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshSpending.isPending ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <button
                onClick={handleCopyPrevious}
                disabled={copyPrevious.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Copy className="w-4 h-4" />
                Copy Previous
              </button>
            </>
          )}

          <button
            onClick={handleCreateBudget}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Budget
          </button>
        </div>
      </div>

      {/* Content */}
      {!hasBudgets ? (
        <>
          <EmptyState
            onCreateBudget={handleCreateBudget}
            onGetRecommendations={() => setShowRecommendations(true)}
          />

          {/* Show recommendations even when no budgets */}
          {showRecommendations && (
            <div className="mt-6">
              <BudgetRecommendations onCreateFromRecommendation={handleCreateFromRecommendation} />
            </div>
          )}
        </>
      ) : (
        <>
          {/* Budget Overview */}
          <BudgetOverview summary={budgetData} />

          {/* Budget Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {budgetData.budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={handleEditBudget}
                onDelete={handleDeleteBudget}
              />
            ))}
          </div>

          {/* Recommendations */}
          <BudgetRecommendations onCreateFromRecommendation={handleCreateFromRecommendation} />
        </>
      )}

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSubmit={handleSubmitBudget}
        editBudget={editingBudget}
        currentMonth={selectedMonth}
      />
    </div>
  );
};

export default Budget;
