import { useEffect, useState } from 'react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import Layout from '../components/layout/Layout';
import MerchantIcon from '../components/common/MerchantIcon';
import Skeleton from '../components/common/Skeleton';
import { recurringAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { dueLabel, frequencyLabel, monthlyCost } from '../utils/recurring';
import { cleanMerchant } from '../utils/merchant';
import Illustration from '../components/common/Illustration';

function ChargeRow({ r }) {
  return (
    <li className="flex items-center gap-3 sm:gap-4 py-3">
      <MerchantIcon logoUrl={r.logoUrl} category={r.category} size="md" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 truncate">{cleanMerchant(r.merchant)}</p>
        <p className="text-xs text-gray-500">
          {frequencyLabel(r.frequency)}
          {r.type === 'bill' && <span>, amount varies</span>}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-gray-900">
          {r.type === 'bill' && <span className="font-medium text-gray-500">about </span>}
          {formatCurrency(r.amount)}
        </p>
        <p className="text-xs text-gray-500">{dueLabel(r.nextDate)}</p>
      </div>
    </li>
  );
}

export default function Recurring() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    recurringAPI.list()
      .then(({ data }) => setItems(data))
      .catch(() => setError(true));
  }, []);

  const today = new Date();
  const soon = (items || []).filter((r) => differenceInCalendarDays(parseISO(r.nextDate), today) <= 30);
  const later = (items || []).filter((r) => differenceInCalendarDays(parseISO(r.nextDate), today) > 30);
  const changed = (items || []).filter((r) => r.previousAmount != null);
  const perMonth = (items || []).reduce((sum, r) => sum + monthlyCost(r), 0);
  const subscriptions = (items || []).filter((r) => r.type === 'subscription').length;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Recurring</h1>

        {error ? (
          <div className="card text-sm text-gray-600">Couldn't load your recurring charges. Try again in a moment.</div>
        ) : items === null ? (
          <div className="space-y-4"><Skeleton className="h-28 w-full rounded-2xl" /><Skeleton className="h-64 w-full rounded-2xl" /></div>
        ) : items.length === 0 ? (
          <div className="card sm:flex sm:items-center sm:gap-8">
            <Illustration name="recurring" className="mb-4 h-28 w-40 shrink-0 sm:order-2 sm:mb-0 sm:ml-auto" />
            <div>
            <p className="text-base font-bold text-gray-900">No bills or subscriptions found yet</p>
            <p className="mt-2 text-sm text-gray-600 max-w-lg">
              We look for the same merchant charging you every month, quarter or year. Once a few months of
              transactions are in, your subscriptions and bills show up here with when they're due.
            </p>
            </div>
          </div>
        ) : (
          <>
            <section className="card p-6 sm:p-8" aria-label="Recurring total">
              <p className="text-sm font-medium text-gray-500">Bills and subscriptions</p>
              <p className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                {formatCurrency(perMonth, false)}<span className="text-xl font-bold text-gray-500"> a month</span>
              </p>
              <p className="mt-2 text-sm text-gray-600">
                {subscriptions} {subscriptions === 1 ? 'subscription' : 'subscriptions'} and {items.length - subscriptions}{' '}
                {items.length - subscriptions === 1 ? 'bill' : 'bills'}. Quarterly and yearly charges are spread over the months.
              </p>
            </section>

            {changed.length > 0 && (
              <section className="card" aria-labelledby="changes-heading">
                <h2 id="changes-heading" className="text-base font-bold text-gray-900">Price changes</h2>
                <ul className="mt-3 divide-y divide-gray-100">
                  {changed.map((r) => {
                    const up = Number(r.amount) > Number(r.previousAmount);
                    return (
                      <li key={r.merchant} className="flex items-center justify-between gap-3 py-3 text-sm">
                        <span className="font-semibold text-gray-900 truncate">{cleanMerchant(r.merchant)}</span>
                        <span className={`shrink-0 font-semibold ${up ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(r.previousAmount)} to {formatCurrency(r.amount)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {[['Next 30 days', soon], ['Later', later]].map(([title, list]) => list.length > 0 && (
              <section key={title} className="card py-2 px-5 sm:px-6" aria-label={title}>
                <h2 className="py-3 text-sm font-bold text-gray-900 border-b border-gray-100">{title}</h2>
                <ul className="divide-y divide-gray-100">
                  {list.map((r) => <ChargeRow key={r.merchant} r={r} />)}
                </ul>
              </section>
            ))}
          </>
        )}
      </div>
    </Layout>
  );
}
