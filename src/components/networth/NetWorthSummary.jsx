import { ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import Skeleton from '../common/Skeleton';

export default function NetWorthSummary({ netWorth }) {
  if (!netWorth) {
    return (
      <div className="card">
        <div className="text-center mb-8 pb-8 border-b border-gray-100">
          <Skeleton className="h-4 w-28 mx-auto mb-3" />
          <Skeleton className="h-10 w-56 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-24 mb-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalAssets = netWorth.totalAssets ?? 0;
  const totalLiabilities = netWorth.totalLiabilities ?? 0;
  const netWorthValue = netWorth.netWorth ?? 0;
  const cashBalance = netWorth.cashBalance ?? 0;
  const investmentsValue = netWorth.investmentsValue ?? 0;
  const manualAssetsValue = netWorth.manualAssetsValue ?? 0;
  const creditCardDebt = netWorth.creditCardDebt ?? 0;
  const manualLiabilities = netWorth.manualLiabilities ?? 0;
  const isPositive = netWorthValue >= 0;

  return (
    <div className="card">
      <div className="text-center mb-8 pb-8 border-b border-gray-100">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
          Total Net Worth
        </p>
        <p className={`text-4xl font-bold ${isPositive ? 'text-gray-900' : 'text-red-600'}`}>
          {formatCurrency(netWorthValue)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Assets</h3>
            <div className="flex items-center gap-1 text-emerald-600">
              <ArrowUp className="w-4 h-4" />
              <span className="text-lg font-bold">{formatCurrency(totalAssets)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Cash</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(cashBalance)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Investments</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(investmentsValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Other Assets</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(manualAssetsValue)}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Liabilities</h3>
            <div className="flex items-center gap-1 text-red-500">
              <ArrowDown className="w-4 h-4" />
              <span className="text-lg font-bold">{formatCurrency(totalLiabilities)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Credit Cards</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(creditCardDebt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Loans & Mortgages</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(manualLiabilities)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
