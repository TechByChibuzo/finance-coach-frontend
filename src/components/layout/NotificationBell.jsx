import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { anomaliesAPI, budgetAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import { categoryLabel } from '../../utils/categories';

// Budgets near or over their limit, and unusual spending the user hasn't dismissed
async function fetchNotifications() {
  // Detection also runs on a schedule; checking here keeps it current for this visit
  await anomaliesAPI.detect().catch(() => null);
  const [alerts, anomalies] = await Promise.all([
    budgetAPI.getBudgetAlerts().then((r) => r.data).catch(() => []),
    anomaliesAPI.getUnreviewed().then((r) => r.data).catch(() => []),
  ]);
  return {
    budgets: [...alerts].sort((a, b) => Number(b.percentageSpent) - Number(a.percentageSpent)),
    anomalies,
  };
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const budgets = data?.budgets ?? [];
  const anomalies = data?.anomalies ?? [];
  const count = budgets.length + anomalies.length;

  const dismiss = async (id) => {
    queryClient.setQueryData(['notifications'], (old) =>
      old ? { ...old, anomalies: old.anomalies.filter((a) => a.id !== id) } : old);
    try {
      await anomaliesAPI.markReviewed(id);
    } catch {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={count ? `Notifications, ${count} new` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-[10px] font-bold leading-4 text-white text-center ring-2 ring-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="fixed sm:absolute inset-x-3 sm:inset-x-auto top-16 sm:top-auto sm:right-0 sm:mt-2 sm:w-96 max-h-[70dvh] overflow-y-auto rounded-2xl border border-gray-200 bg-surface shadow-xl z-50"
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-base font-bold text-gray-900">Notifications</p>
          </div>

          {count === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-500 leading-relaxed">
              You're all caught up. We'll tell you here when a budget gets close to its limit or spending
              in a category is unusually high.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {budgets.length > 0 && (
                <section className="px-5 py-4">
                  <h3 className="text-xs font-semibold text-gray-500 mb-3">Budgets</h3>
                  <ul className="space-y-3">
                    {budgets.map((b) => {
                      const over = Number(b.percentageSpent) > 100;
                      return (
                        <li key={b.id}>
                          <Link to="/budget" onClick={() => setOpen(false)} className="block rounded-lg -mx-2 px-2 py-1.5 hover:bg-gray-50">
                            <p className="text-sm text-gray-900">
                              <span className="font-semibold">{b.category}</span>{' '}
                              {over
                                ? <>is <span className="font-semibold text-red-600">{formatCurrency(Number(b.spent) - Number(b.amount), false)} over</span> budget</>
                                : <>is at <span className="font-semibold text-amber-600">{Math.round(Number(b.percentageSpent))}%</span> of its budget</>}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatCurrency(b.spent, false)} of {formatCurrency(b.amount, false)} this month
                            </p>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {anomalies.length > 0 && (
                <section className="px-5 py-4">
                  <h3 className="text-xs font-semibold text-gray-500 mb-3">Unusual spending</h3>
                  <ul className="space-y-3">
                    {anomalies.map((a) => (
                      <li key={a.id} className="flex items-start justify-between gap-3">
                        <Link to="/transactions" onClick={() => setOpen(false)} className="min-w-0 rounded-lg -mx-2 px-2 py-1.5 hover:bg-gray-50">
                          <p className="text-sm text-gray-900">
                            <span className="font-semibold">{categoryLabel(a.category)}</span> spending is higher than usual
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatCurrency(a.currentSpend, false)} this month, usually about {formatCurrency(a.averageSpend, false)}
                          </p>
                        </Link>
                        <button
                          onClick={() => dismiss(a.id)}
                          className="shrink-0 mt-1 text-xs font-semibold text-gray-500 hover:text-gray-800"
                          aria-label={`Dismiss the ${categoryLabel(a.category)} alert`}
                        >
                          Dismiss
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
