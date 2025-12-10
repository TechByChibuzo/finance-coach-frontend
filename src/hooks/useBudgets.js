// src/hooks/useBudgets.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetAPI } from '../services/api';
import { format } from 'date-fns';

/**
 * React Query hooks for budget management
 */

/**
 * Get budgets for a specific month
 */
export const useBudgets = (month) => {
  const monthStr = month ? format(month, 'yyyy-MM-dd') : null;
  
  return useQuery({
    queryKey: ['budgets', monthStr],
    queryFn: () => monthStr 
      ? budgetAPI.getBudgetsForMonth(monthStr)
      : budgetAPI.getCurrentMonthBudgets(),
    select: (response) => response.data,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Get current month budgets
 */
export const useCurrentBudgets = () => {
  return useQuery({
    queryKey: ['budgets', 'current'],
    queryFn: budgetAPI.getCurrentMonthBudgets,
    select: (response) => response.data,
    staleTime: 30000,
  });
};

/**
 * Get budget progress
 */
export const useBudgetProgress = (month) => {
  const monthStr = month ? format(month, 'yyyy-MM-dd') : null;
  
  return useQuery({
    queryKey: ['budgetProgress', monthStr],
    queryFn: () => budgetAPI.getBudgetProgress(monthStr),
    select: (response) => response.data,
    staleTime: 30000,
  });
};

/**
 * Get budget recommendations
 */
export const useBudgetRecommendations = () => {
  return useQuery({
    queryKey: ['budgetRecommendations'],
    queryFn: budgetAPI.getBudgetRecommendations,
    select: (response) => response.data,
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Get exceeded budgets
 */
export const useExceededBudgets = () => {
  return useQuery({
    queryKey: ['budgets', 'exceeded'],
    queryFn: budgetAPI.getExceededBudgets,
    select: (response) => response.data,
    staleTime: 30000,
  });
};

/**
 * Get budget alerts
 */
export const useBudgetAlerts = () => {
  return useQuery({
    queryKey: ['budgets', 'alerts'],
    queryFn: budgetAPI.getBudgetAlerts,
    select: (response) => response.data,
    staleTime: 30000,
  });
};

/**
 * Create or update a budget
 */
export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: budgetAPI.createBudget,
    onSuccess: () => {
      // Invalidate all budget queries to refetch
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetProgress'] });
    },
  });
};

/**
 * Update a budget
 */
export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: budgetAPI.updateBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetProgress'] });
    },
  });
};

/**
 * Delete a budget
 */
export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: budgetAPI.deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetProgress'] });
    },
  });
};

/**
 * Refresh budget spending
 */
export const useRefreshBudgetSpending = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (month) => {
      const monthStr = month ? format(month, 'yyyy-MM-dd') : null;
      return budgetAPI.refreshBudgetSpending(monthStr);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetProgress'] });
    },
  });
};

/**
 * Copy previous month's budgets
 */
export const useCopyPreviousBudgets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: budgetAPI.copyPreviousMonthBudgets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetProgress'] });
    },
  });
};