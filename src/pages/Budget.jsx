// src/pages/Budget.jsx 
import { useState } from 'react';
import { Plus, RefreshCw, Copy } from 'lucide-react';
import { startOfMonth, format } from 'date-fns';
import { toast } from 'react-hot-toast';

// Components
import Layout from '../components/layout/Layout';
import MonthSelector from '../components/budget/MonthSelector';
import BudgetOverview from '../components/budget/BudgetOverview';
import BudgetCard from '../components/budget/BudgetCard';
import BudgetModal from '../components/budget/BudgetModal';
import BudgetRecommendations from '../components/budget/BudgetRecommendations';
import EmptyState from '../components/budget/EmptyState';
import BudgetSkeleton from '../components/budget/BudgetSkeleton';
import ErrorMessage from '../components/common/ErrorMessage';

// Hooks
import {
  useBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
  useRefreshBudgetSpending,
  useCopyPreviousBudgets,
} from '../hooks/useBudgets';

export default function Budget() {
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [recommendationData, setRecommendationData] = useState(null); // NEW STATE
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Queries
  const { data: budgetData, isLoading, error, refetch } = useBudgets(selectedMonth);

  // Mutations
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();
  const refreshSpending = useRefreshBudgetSpending();
  const copyPrevious = useCopyPreviousBudgets();

  // Handlers
  const handleCreateBudget = () => {
    setEditingBudget(null);
    setRecommendationData(null); // CLEAR recommendation data
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setRecommendationData(null); // CLEAR recommendation data
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
      setRecommendationData(null); // CLEAR recommendation data
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

  // FIXED: Handle recommendation click
  const handleCreateFromRecommendation = ({ category, amount }) => {
    setEditingBudget(null);
    setRecommendationData({ category, amount }); // SET recommendation data
    setIsModalOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <BudgetSkeleton />
      </Layout>
    );
  }

  // Error state
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
      <div className="space-y-6 slide-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title & Month Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
              <p className="text-gray-500 mt-1">Track your spending by category</p>
            </div>
            <MonthSelector currentMonth={selectedMonth} onMonthChange={setSelectedMonth} />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {hasBudgets && (
              <>
                <button
                  onClick={handleRefreshSpending}
                  disabled={refreshSpending.isPending}
                  className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshSpending.isPending ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  onClick={handleCopyPrevious}
                  disabled={copyPrevious.isPending}
                  className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy Previous</span>
                </button>
              </>
            )}

            <button
              onClick={handleCreateBudget}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Budget</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {!hasBudgets ? (
          <div className="fade-in">
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
          </div>
        ) : (
          <>
            {/* Budget Overview - with fade in */}
            <div className="fade-in">
              <BudgetOverview summary={budgetData} />
            </div>

            {/* Budget Cards Grid - with staggered fade in */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgetData.budgets.map((budget, index) => (
                <div 
                  key={budget.id} 
                  className="fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <BudgetCard
                    budget={budget}
                    onEdit={handleEditBudget}
                    onDelete={handleDeleteBudget}
                  />
                </div>
              ))}
            </div>

            {/* Recommendations - with fade in */}
            <div className="fade-in" style={{ animationDelay: '0.3s' }}>
              <BudgetRecommendations onCreateFromRecommendation={handleCreateFromRecommendation} />
            </div>
          </>
        )}

        {/* Budget Modal - FIXED: Pass recommendationData */}
        <BudgetModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBudget(null);
            setRecommendationData(null); // CLEAR on close
          }}
          onSubmit={handleSubmitBudget}
          editBudget={editingBudget}
          recommendationData={recommendationData} // PASS recommendation data
          currentMonth={selectedMonth}
        />
      </div>
    </Layout>
  );
}