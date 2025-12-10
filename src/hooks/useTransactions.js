import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsAPI } from '../services/api';
import toast from 'react-hot-toast';

export function useTransactions() {
  const queryClient = useQueryClient();

  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await transactionsAPI.getAll();
      return response.data;
    },
  });

  const syncMutation = useMutation({
    mutationFn: () => transactionsAPI.sync(),
    onMutate: () => {
      toast.loading('Syncing transactions...', { id: 'sync' });
    },
    onSuccess: () => {
      toast.success('✅ Transactions synced!', { id: 'sync' });
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Sync failed:', error);
      toast.error('Failed to sync transactions', { id: 'sync' });
    },
  });

  return {
    transactions: transactions || [],
    isLoading,
    error,
    sync: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
  };
}