import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, Plus, Target } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Skeleton from '../components/common/Skeleton';
import GoalModal from '../components/goals/GoalModal';
import AddMoneyModal from '../components/goals/AddMoneyModal';
import { goalsAPI, plaidAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';

// Accounts whose balance can count as savings
const SAVINGS_TYPES = ['depository', 'investment'];

function goalStatus(goal) {
  if (goal.reached) return 'Reached. Nice work.';
  if (goal.pastDue) return `${format(parseISO(goal.targetDate), 'MMM d, yyyy')} has passed, ${formatCurrency(goal.remaining, false)} to go`;
  if (goal.monthlyNeeded != null) {
    return `Save ${formatCurrency(goal.monthlyNeeded, false)} a month to reach it by ${format(parseISO(goal.targetDate), 'MMM yyyy')}`;
  }
  return `${formatCurrency(goal.remaining, false)} to go`;
}

function GoalCard({ goal, onEdit, onAddMoney }) {
  return (
    <article className="card flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-900 truncate">{goal.name}</h2>
          <p className="mt-0.5 text-xs text-gray-500 truncate">
            {goal.accountName ? `Following ${goal.accountName}` : 'Tracked by hand'}
          </p>
        </div>
        {goal.reached && <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-600" aria-label="Reached" />}
      </div>

      <p className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900 tabular-nums">
        {formatCurrency(goal.saved, false)}
        <span className="text-sm font-medium text-gray-500"> of {formatCurrency(goal.targetAmount, false)}</span>
      </p>
      <div className="mt-2 h-2 rounded-full bg-gray-100" role="progressbar" aria-valuenow={goal.percent} aria-valuemin={0} aria-valuemax={100}
        aria-label={`${goal.name}: ${goal.percent}% saved`}>
        <div className="h-full rounded-full bg-primary-600" style={{ width: `${Math.max(goal.percent, goal.saved > 0 ? 2 : 0)}%` }} />
      </div>
      <p className={`mt-2 text-sm ${goal.pastDue ? 'text-amber-600' : 'text-gray-600'}`}>
        <span className="font-semibold tabular-nums">{goal.percent}%</span> · {goalStatus(goal)}
      </p>

      <div className="mt-auto flex gap-4 pt-4">
        {!goal.accountId && !goal.reached && (
          <button onClick={onAddMoney} className="text-sm font-semibold text-primary-600 hover:text-primary-700">Add money</button>
        )}
        <button onClick={onEdit} className="text-sm font-semibold text-gray-500 hover:text-gray-800">Edit</button>
      </div>
    </article>
  );
}

export default function Goals() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null); // a goal, 'new', or null
  const [adding, setAdding] = useState(null);

  const { data: goals, isLoading, isError } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsAPI.list().then((r) => r.data),
  });
  const { data: accounts = [] } = useQuery({
    queryKey: ['plaid-accounts'],
    queryFn: () => plaidAPI.getAccounts().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
  const savingsAccounts = accounts.filter((a) => SAVINGS_TYPES.includes(a.accountType?.toLowerCase()));

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['goals'] });

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex items-end justify-between gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Goals</h1>
          {goals?.length > 0 && (
            <button onClick={() => setEditing('new')} className="btn-primary flex items-center gap-1.5 text-sm">
              <Plus className="h-4 w-4" aria-hidden />
              New goal
            </button>
          )}
        </header>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}</div>
        ) : isError ? (
          <div className="card text-sm text-gray-600">Couldn't load your goals. Try again in a moment.</div>
        ) : goals.length === 0 ? (
          <div className="card flex flex-col items-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
              <Target className="h-6 w-6 text-primary-600" aria-hidden />
            </div>
            <p className="mt-3 text-base font-semibold text-gray-900">Save for something</p>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              An emergency fund, a trip, a down payment. Set an amount and a date, and see how much to put aside each month.
            </p>
            <button onClick={() => setEditing('new')} className="btn-primary mt-5 flex items-center gap-1.5 text-sm">
              <Plus className="h-4 w-4" aria-hidden />
              Create a goal
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((g) => (
              <GoalCard key={g.id} goal={g} onEdit={() => setEditing(g)} onAddMoney={() => setAdding(g)} />
            ))}
          </div>
        )}
      </div>

      {editing && (
        <GoalModal goal={editing === 'new' ? null : editing} accounts={savingsAccounts}
          onClose={() => setEditing(null)} onSaved={refresh} />
      )}
      {adding && <AddMoneyModal goal={adding} onClose={() => setAdding(null)} onSaved={refresh} />}
    </Layout>
  );
}
