import { Store } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export default function TopMerchants({ merchants }) {
  const merchantsList = Object.entries(merchants || {})
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const maxAmount = merchantsList[0]?.amount || 1;

  if (merchantsList.length === 0) {
    return (
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Top Merchants</h2>
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Store className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-400">No merchant data yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">Top Merchants</h2>
        <p className="text-xs text-gray-400 mt-0.5">Your top {merchantsList.length} merchants this month</p>
      </div>

      <div className="space-y-4">
        {merchantsList.map((merchant, index) => (
          <div key={merchant.name}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 shrink-0">
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-gray-800 truncate">{merchant.name}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 ml-2 shrink-0">
                {formatCurrency(merchant.amount)}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-10">
              <div
                className="h-full bg-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${(merchant.amount / maxAmount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
