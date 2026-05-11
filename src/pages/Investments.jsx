import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { investmentsAPI } from '../services/api';
import Layout from '../components/layout/Layout';
import PortfolioSummary from '../components/investments/PortfolioSummary';
import HoldingsTable from '../components/investments/HoldingsTable';
import AllocationChart from '../components/investments/AllocationChart';
import PerformanceChart from '../components/investments/PerformanceChart';
import ErrorMessage from '../components/common/ErrorMessage';
import Skeleton from '../components/common/Skeleton';
import { RefreshCw, TrendingUp, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

function InvestmentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-28" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="card">
            <Skeleton className="h-5 w-32 mb-5" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <div className="card">
        <Skeleton className="h-5 w-24 mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3.5 border-b border-gray-100 last:border-0">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Investments() {
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  const { data: portfolioResponse, isLoading: portfolioLoading, error } = useQuery({
    queryKey: ['portfolio'],
    queryFn: investmentsAPI.getPortfolio,
  });

  const portfolio = portfolioResponse?.data;

  const { data: allocationResponse } = useQuery({
    queryKey: ['allocation'],
    queryFn: investmentsAPI.getAllocation,
  });

  const allocation = allocationResponse?.data;

  const { data: historyResponse } = useQuery({
    queryKey: ['portfolio-history', selectedPeriod],
    queryFn: () => investmentsAPI.getHistory(selectedPeriod),
  });

  const history = historyResponse?.data;

  const syncMutation = useMutation({
    mutationFn: investmentsAPI.syncAllHoldings,
    onSuccess: () => {
      queryClient.invalidateQueries(['portfolio']);
      queryClient.invalidateQueries(['allocation']);
      toast.success('✅ Holdings synced successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to sync holdings');
    },
  });

  const handleSync = () => {
    toast.loading('Syncing holdings...', { id: 'sync' });
    syncMutation.mutate();
  };

  if (portfolioLoading) {
    return (
      <Layout>
        <InvestmentsSkeleton />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorMessage
          message={error?.message || 'Failed to load portfolio data'}
          onRetry={() => queryClient.invalidateQueries(['portfolio'])}
        />
      </Layout>
    );
  }

  if (!portfolio || !portfolio.holdings?.length) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
              <p className="text-sm text-gray-500 mt-1">Track your portfolio performance</p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncMutation.isPending}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              <span>{syncMutation.isPending ? 'Syncing...' : 'Sync Holdings'}</span>
            </button>
          </div>

          <div className="card text-center py-14">
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-1">No investment accounts connected</p>
            <p className="text-sm text-gray-400 mb-4">Connect an investment account to start tracking your portfolio</p>
            <button
              onClick={handleSync}
              disabled={syncMutation.isPending}
              className="btn-primary inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              <span>{syncMutation.isPending ? 'Syncing...' : 'Sync Investment Accounts'}</span>
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
            <p className="text-sm text-gray-500 mt-1">
              {portfolio.holdings?.length || 0} holding{portfolio.holdings?.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            <span>{syncMutation.isPending ? 'Syncing...' : 'Sync Holdings'}</span>
          </button>
        </div>

        <PortfolioSummary portfolio={portfolio} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AllocationChart allocation={allocation?.allocation} />
          <PerformanceChart
            history={history}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </div>

        <HoldingsTable holdings={portfolio?.holdings || []} />
      </div>
    </Layout>
  );
}
