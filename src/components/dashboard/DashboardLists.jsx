import { Link } from 'react-router-dom';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import CategoryIcon from '../common/CategoryIcon';
import MerchantIcon from '../common/MerchantIcon';
import { formatCurrency } from '../../utils/helpers';
import { categoryLabel } from '../../utils/categories';
import { dueLabel } from '../../utils/recurring';
import { cleanMerchant, merchantOf } from '../../utils/merchant';
import { isTransfer } from '../../utils/transactions';

const Panel = ({ title, action, children, className = '' }) => (
  <section className={`card ${className}`}>
    <div className="flex items-baseline justify-between mb-5">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

const PanelLink = ({ to, children }) => (
  <Link to={to} className="text-sm font-semibold text-primary-600 hover:text-primary-700 rounded focus-visible:outline-2 focus-visible:outline-primary-600">
    {children}
  </Link>
);

const Empty = ({ children }) => <p className="text-sm text-gray-500 py-6">{children}</p>;

const budgetTone = (pct) => {
  if (pct > 100) return { bar: 'bg-red-500', text: 'text-red-600' };
  if (pct >= 80) return { bar: 'bg-amber-500', text: 'text-amber-600' };
  return { bar: 'bg-primary-500', text: 'text-gray-500' };
};

export function BudgetProgress({ budgets }) {
  const items = budgets?.budgets || [];
  return (
    <Panel
      title="Budgets"
      action={<PanelLink to="/budget">{items.length ? 'Manage' : 'Set up'}</PanelLink>}
    >
      {items.length === 0 ? (
        <Empty>Set a monthly budget for a category to see how it's tracking here.</Empty>
      ) : (
        <>
          <p className="text-sm text-gray-500 -mt-3 mb-5">
            <span className="font-semibold text-gray-900">{formatCurrency(budgets.totalSpent, false)}</span>
            {' '}of {formatCurrency(budgets.totalBudget, false)} budgeted this month
          </p>
          <ul className="space-y-5">
            {items.map((b) => {
              const pct = Number(b.percentageSpent || 0);
              const tone = budgetTone(pct);
              const remaining = Number(b.remaining || 0);
              return (
                <li key={b.id}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-semibold text-gray-900 truncate">{b.category}</span>
                    <span className={`shrink-0 font-medium ${tone.text}`}>
                      {remaining >= 0
                        ? `${formatCurrency(remaining, false)} left`
                        : `${formatCurrency(-remaining, false)} over`}
                    </span>
                  </div>
                  <div
                    className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={Math.round(pct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${b.category}: ${Math.round(pct)}% of budget spent`}
                  >
                    <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    {formatCurrency(b.spent, false)} of {formatCurrency(b.available ?? b.amount, false)}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Panel>
  );
}

export function CategoryBars({ breakdown }) {
  const rows = Object.entries(breakdown || {})
    .map(([category, amount]) => ({ category, amount: Number(amount) }))
    .filter((r) => r.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const max = rows[0]?.amount || 1;

  return (
    <Panel title="Where it went">
      {rows.length === 0 ? (
        <Empty>No spending this month yet.</Empty>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r.category} className="flex items-center gap-3">
              <CategoryIcon category={r.category} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium text-gray-800 truncate">{categoryLabel(r.category)}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(r.amount, false)}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-primary-500/70" style={{ width: `${(r.amount / max) * 100}%` }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function MerchantList({ merchants }) {
  const rows = Object.entries(merchants || {}).slice(0, 5);
  return (
    <Panel title="Top merchants">
      {rows.length === 0 ? (
        <Empty>Your most frequent places to spend will show up here.</Empty>
      ) : (
        <ul className="divide-y divide-gray-100">
          {rows.map(([name, amount]) => (
            <li key={name} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 text-sm">
              <span className="font-medium text-gray-800 truncate">{cleanMerchant(name)}</span>
              <span className="font-semibold text-gray-900 shrink-0">{formatCurrency(amount, false)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function RecentTransactions({ transactions, onSync, syncing }) {
  return (
    <Panel title="Recent transactions" action={<PanelLink to="/transactions">See all</PanelLink>}>
      {transactions.length === 0 ? (
        <div className="py-6">
          <p className="text-sm text-gray-500 mb-4">Connect a bank in Settings, then sync to bring in your transactions.</p>
          <button onClick={onSync} disabled={syncing} className="btn-primary text-sm">
            {syncing ? 'Syncing…' : 'Sync now'}
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {transactions.map((t) => {
            const moneyIn = t.amount < 0;
            const transfer = isTransfer(t);
            return (
              <li key={t.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <MerchantIcon logoUrl={t.logoUrl} category={t.category} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{merchantOf(t)}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {transfer ? 'Transfer' : categoryLabel(t.category)}
                    {t.pending && <span className="ml-1.5 text-amber-600">Pending</span>}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${transfer || t.hidden ? 'text-gray-400' : moneyIn ? 'text-green-600' : 'text-gray-900'}`}>
                    {moneyIn ? '+' : ''}{formatCurrency(Math.abs(t.amount))}
                  </p>
                  <p className="text-xs text-gray-500">{format(parseISO(t.date), 'MMM d')}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

export function NetWorthCard({ netWorth }) {
  if (!netWorth) return null;
  const value = Number(netWorth.netWorth ?? 0);
  return (
    <Panel title="Net worth" action={<PanelLink to="/net-worth">Details</PanelLink>}>
      <p className={`text-3xl font-extrabold tracking-tight ${value < 0 ? 'text-red-600' : 'text-gray-900'}`}>
        {formatCurrency(value, false)}
      </p>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">What you own</dt>
          <dd className="font-semibold text-gray-900">{formatCurrency(netWorth.totalAssets, false)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">What you owe</dt>
          <dd className="font-semibold text-gray-900">{formatCurrency(netWorth.totalLiabilities, false)}</dd>
        </div>
      </dl>
    </Panel>
  );
}

export function ComingUp({ recurring }) {
  const today = new Date();
  const upcoming = (recurring || [])
    .filter((r) => differenceInCalendarDays(parseISO(r.nextDate), today) <= 14)
    .slice(0, 5);
  if (!recurring?.length) return null;
  return (
    <Panel title="Coming up" action={<PanelLink to="/recurring">See all</PanelLink>}>
      {upcoming.length === 0 ? (
        <Empty>No bills or subscriptions due in the next two weeks.</Empty>
      ) : (
        <ul className="divide-y divide-gray-100">
          {upcoming.map((r) => (
            <li key={r.merchant} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <MerchantIcon logoUrl={r.logoUrl} category={r.category} size="sm" />
              <span className="min-w-0 flex-1 text-sm font-medium text-gray-800 truncate">{cleanMerchant(r.merchant)}</span>
              <span className="text-right shrink-0">
                <span className="block text-sm font-semibold text-gray-900">{formatCurrency(r.amount)}</span>
                <span className="block text-xs text-gray-500">{dueLabel(r.nextDate)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
