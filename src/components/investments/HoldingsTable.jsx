import { ArrowUp, ArrowDown, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

function formatQuantity(qty) {
  if (qty === 0) return '0';
  if (Math.abs(qty) < 0.01) return qty.toFixed(6);
  if (Math.abs(qty) < 1) return qty.toFixed(4);
  return qty.toFixed(2);
}

function formatPct(pct) {
  if (Math.abs(pct) > 9999) return pct > 0 ? '>9,999%' : '<-9,999%';
  return `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%`;
}

const TYPE_LABELS = {
  stock:       'Stock',
  etf:         'ETF',
  bond:        'Bond',
  cash:        'Cash',
  crypto:      'Crypto',
  mutual_fund: 'Mutual Fund',
  other:       'Other',
};

export default function HoldingsTable({ holdings }) {
  if (!holdings || holdings.length === 0) {
    return (
      <div className="card text-center py-14">
        <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500 mb-1">No holdings yet</p>
        <p className="text-sm text-gray-400">Sync your investment accounts to see your holdings</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Holdings</h2>
        <p className="text-xs text-gray-400 mt-0.5">{holdings.length} position{holdings.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Symbol</th>
              <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Name</th>
              <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Type</th>
              <th className="pb-3 pr-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Qty</th>
              <th className="pb-3 pr-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Price</th>
              <th className="pb-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Value</th>
              <th className="pb-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Gain / Loss</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {holdings.map((holding) => {
              const quantity = holding.quantity ?? 0;
              const currentPrice = holding.currentPrice ?? 0;
              const currentValue = holding.currentValue ?? 0;
              const gainLoss = holding.gainLoss ?? 0;
              const gainLossPercentage = holding.gainLossPercentage ?? 0;
              const isPositive = gainLoss >= 0;

              return (
                <tr key={holding.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 pr-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {holding.symbol || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <p className="text-sm text-gray-900">{holding.name || 'Unknown'}</p>
                    {holding.accountName && (
                      <p className="text-xs text-gray-400 mt-0.5">{holding.accountName}</p>
                    )}
                  </td>
                  <td className="py-3.5 pr-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-gray-100 text-gray-600">
                      {TYPE_LABELS[holding.type?.toLowerCase()] || holding.type || 'Other'}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-right text-sm text-gray-600 whitespace-nowrap">
                    {formatQuantity(quantity)}
                  </td>
                  <td className="py-3.5 pr-4 text-right text-sm text-gray-600 whitespace-nowrap">
                    {formatCurrency(currentPrice)}
                  </td>
                  <td className="py-3.5 text-right text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {formatCurrency(currentValue)}
                  </td>
                  <td className="py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-start justify-end gap-1">
                      {isPositive
                        ? <ArrowUp className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        : <ArrowDown className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      }
                      <div className="text-right">
                        <p className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(Math.abs(gainLoss))}
                        </p>
                        <p className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {formatPct(gainLossPercentage)}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
