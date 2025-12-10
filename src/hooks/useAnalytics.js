import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import { format, subDays } from 'date-fns';

export function useAnalytics(dateRange = 30) {
  const endDate = format(new Date(), 'yyyy-MM-dd');
  const startDate = format(subDays(new Date(), dateRange), 'yyyy-MM-dd');

  const monthlySummary = useQuery({
    queryKey: ['monthlySummary'],
    queryFn: async () => {
      const response = await analyticsAPI.getMonthlySummary();
      return response.data;
    },
  });

  const spendingTrend = useQuery({
    queryKey: ['spendingTrend', startDate, endDate],
    queryFn: async () => {
      const response = await analyticsAPI.getSpendingTrend(startDate, endDate);
      return response.data;
    },
  });

  const categoryBreakdown = useQuery({
    queryKey: ['categoryBreakdown', startDate, endDate],
    queryFn: async () => {
      const response = await analyticsAPI.getSpendingByCategory(startDate, endDate);
      return response.data;
    },
  });

  const topMerchants = useQuery({
    queryKey: ['topMerchants', startDate, endDate],
    queryFn: async () => {
      const response = await analyticsAPI.getTopMerchants(startDate, endDate, 5);
      return response.data;
    },
  });

  return {
    monthlySummary: monthlySummary.data,
    spendingTrend: spendingTrend.data,
    categoryBreakdown: categoryBreakdown.data,
    topMerchants: topMerchants.data,
    isLoading: 
      monthlySummary.isLoading || 
      spendingTrend.isLoading || 
      categoryBreakdown.isLoading || 
      topMerchants.isLoading,
    error: 
      monthlySummary.error || 
      spendingTrend.error || 
      categoryBreakdown.error || 
      topMerchants.error,
    refetch: () => {
      monthlySummary.refetch();
      spendingTrend.refetch();
      categoryBreakdown.refetch();
      topMerchants.refetch();
    },
  };
}