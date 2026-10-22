import { useEffect, useState } from 'react';
import { Loader, X } from 'lucide-react';
import { goalsAPI } from '../../services/api';

const inputClass = 'w-full rounded-xl border border-gray-200 bg-surface px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';
const MANUAL = 'manual';

/**
 * Create or edit a savings goal. accounts are the user's savings, checking and investment
 * accounts, any of which can be followed for progress.
 */
export default function GoalModal({ goal, accounts, onClose, onSaved }) {
  const editing = Boolean(goal);
  const [name, setName] = useState(goal?.name || '');
  const [target, setTarget] = useState(goal ? String(goal.targetAmount) : '');
  const [date, setDate] = useState(goal?.targetDate || '');
  const [source, setSource] = useState(goal?.accountId || MANUAL);
  const [saved, setSaved] = useState(goal && !goal.accountId ? String(goal.saved) : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !busy && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, busy]);

  const run = async (action) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.status === 400 && err.response.data?.message
        ? err.response.data.message
        : "Couldn't save the goal. Try again.");
      setBusy(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const targetAmount = Number.parseFloat(target);
    if (!name.trim() || !(targetAmount > 0)) {
      setError('Give the goal a name and an amount to save.');
      return;
    }
    const body = {
      name: name.trim(),
      targetAmount: Math.round(targetAmount * 100) / 100,
      targetDate: date || null,
      accountId: source === MANUAL ? null : source,
      savedAmount: source === MANUAL ? Math.round((Number.parseFloat(saved) || 0) * 100) / 100 : null,
    };
    run(() => (editing ? goalsAPI.update(goal.id, body) : goalsAPI.create(body)));
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/50 sm:p-4" role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="goal-title"
        className="w-full sm:max-w-md max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-surface shadow-xl">
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 id="goal-title" className="text-lg font-bold text-gray-900">{editing ? 'Edit goal' : 'New goal'}</h2>
          <button type="button" onClick={onClose} disabled={busy} className="p-2 -mr-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-4">
          <div>
            <label htmlFor="goal-name" className="text-sm font-semibold text-gray-900">What are you saving for?</label>
            <input id="goal-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100}
              placeholder="Emergency fund" className={`mt-1.5 ${inputClass}`} autoFocus={!editing} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="goal-target" className="text-sm font-semibold text-gray-900">Amount</label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                <input id="goal-target" inputMode="decimal" value={target} placeholder="10,000"
                  onChange={(e) => setTarget(e.target.value.replace(/[^\d.]/g, ''))} className={`${inputClass} pl-7 tabular-nums`} />
              </div>
            </div>
            <div>
              <label htmlFor="goal-date" className="text-sm font-semibold text-gray-900">By <span className="font-normal text-gray-500">(optional)</span></label>
              <input id="goal-date" type="date" value={date} min={editing ? undefined : today}
                onChange={(e) => setDate(e.target.value)} className={`mt-1.5 ${inputClass}`} />
            </div>
          </div>

          <div>
            <label htmlFor="goal-source" className="text-sm font-semibold text-gray-900">Track progress with</label>
            <select id="goal-source" value={source} onChange={(e) => setSource(e.target.value)} className={`mt-1.5 ${inputClass}`}>
              <option value={MANUAL}>I'll update it myself</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.accountName}{a.mask ? ` ••${a.mask}` : ''} ({a.institutionName})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {source === MANUAL
                ? 'Add money to the goal whenever you put some aside.'
                : "Progress is that account's balance, updated when your accounts sync."}
            </p>
          </div>

          {source === MANUAL && (
            <div>
              <label htmlFor="goal-saved" className="text-sm font-semibold text-gray-900">Saved so far</label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                <input id="goal-saved" inputMode="decimal" value={saved} placeholder="0"
                  onChange={(e) => setSaved(e.target.value.replace(/[^\d.]/g, ''))} className={`${inputClass} pl-7 tabular-nums`} />
              </div>
            </div>
          )}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        </div>

        <div className="flex items-center gap-2 border-t border-gray-100 px-6 py-4">
          {editing && (
            <button type="button" disabled={busy} onClick={() => run(() => goalsAPI.remove(goal.id))}
              className="mr-auto text-sm font-semibold text-gray-500 hover:text-red-600">
              Delete goal
            </button>
          )}
          <button type="button" onClick={onClose} disabled={busy} className={`btn-secondary text-sm ${editing ? '' : 'ml-auto'}`}>Cancel</button>
          <button type="submit" disabled={busy} className="btn-primary text-sm flex items-center gap-2">
            {busy && <Loader className="w-4 h-4 animate-spin" aria-hidden />}
            {editing ? 'Save' : 'Create goal'}
          </button>
        </div>
      </form>
    </div>
  );
}
