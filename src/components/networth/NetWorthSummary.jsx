import { formatCurrency } from '../../utils/helpers';
import Skeleton from '../common/Skeleton';

function Breakdown({ title, total, rows, tone }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <p className="text-base font-bold text-gray-900">{formatCurrency(total, false)}</p>
      </div>
      <ul className="space-y-4">
        {rows.map((r) => (
          <li key={r.label}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-gray-600">{r.label}</span>
              <span className="font-semibold text-gray-900">{formatCurrency(r.value, false)}</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-gray-100">
              <div className={`h-full rounded-full ${tone}`} style={{ width: `${(r.value / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function NetWorthSummary({ netWorth }) {
  if (!netWorth) {
    return (
      <div className="card space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const value = Number(netWorth.netWorth ?? 0);
  const assets = [
    { label: 'Cash', value: Number(netWorth.cashBalance ?? 0) },
    { label: 'Investments', value: Number(netWorth.investmentsValue ?? 0) },
    { label: 'Property and other assets', value: Number(netWorth.manualAssetsValue ?? 0) },
  ];
  const liabilities = [
    { label: 'Loans and mortgages', value: Number(netWorth.loanDebt ?? 0) },
    { label: 'Credit cards', value: Number(netWorth.creditCardDebt ?? 0) },
    { label: 'Other debts', value: Number(netWorth.manualLiabilities ?? 0) },
  ];

  return (
    <section className="card p-6 sm:p-8" aria-label="Net worth">
      <p className="text-sm font-medium text-gray-500">Net worth</p>
      <p className={`mt-2 text-5xl sm:text-6xl font-extrabold tracking-tight ${value < 0 ? 'text-red-600' : 'text-gray-900'}`}>
        {formatCurrency(value, false)}
      </p>
      <p className="mt-3 text-sm text-gray-500">
        What you own minus what you owe, across your linked accounts and anything you've added.
      </p>
      <div className="mt-8 pt-6 border-t border-gray-100 grid md:grid-cols-2 gap-8 md:gap-12">
        <Breakdown title="What you own" total={Number(netWorth.totalAssets ?? 0)} rows={assets} tone="bg-primary-500/70" />
        <Breakdown title="What you owe" total={Number(netWorth.totalLiabilities ?? 0)} rows={liabilities} tone="bg-red-500/60" />
      </div>
    </section>
  );
}
