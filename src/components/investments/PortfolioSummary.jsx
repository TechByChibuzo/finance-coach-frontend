import { ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import Skeleton from '../common/Skeleton';

export default function PortfolioSummary({ portfolio }) {
  if (!portfolio) {
    return (
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
    );
  }

  const totalValue = portfolio.totalValue ?? 0;
  const totalCostBasis = portfolio.totalCostBasis ?? 0;
  const totalGainLoss = portfolio.totalGainLoss ?? 0;
  const gainLossPercentage = portfolio.gainLossPercentage ?? 0;
  const isPositive = totalGainLoss >= 0;

  return (
    <div className="card">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p className="text-xs text-gray-400 mb-1.5">Portfolio Value</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-1.5">Cost Basis</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCostBasis)}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-1.5">Total Gain / Loss</p>
          <div className="flex items-center gap-1">
            {isPositive
              ? <ArrowUp className="w-4 h-4 text-green-500 shrink-0" />
              : <ArrowDown className="w-4 h-4 text-red-500 shrink-0" />
            }
            <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(totalGainLoss))}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-1.5">Return</p>
          <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{gainLossPercentage.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}
