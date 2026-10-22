import { useEffect, useState } from 'react';
import { Loader, X } from 'lucide-react';
import { goalsAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';

/**
 * Put money towards a goal tracked by hand, or take some out
 */
export default function AddMoneyModal({ goal, onClose, onSaved }) {
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !busy && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, busy]);

  const submit = async (direction) => {
    const cents = Math.round((Number.parseFloat(amount) || 0) * 100);
    if (cents <= 0) {
      setError('Enter an amount.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await goalsAPI.addToSaved(goal.id, (direction * cents) / 100);
      onSaved();
      onClose();
    } catch {
      setError("Couldn't update the goal. Try again.");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/50 sm:p-4" role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <form onSubmit={(e) => { e.preventDefault(); submit(1); }} role="dialog" aria-modal="true" aria-labelledby="add-money-title"
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-surface shadow-xl">
        <div className="flex items-start justify-between px-6 pt-5">
          <div>
            <h2 id="add-money-title" className="text-lg font-bold text-gray-900">{goal.name}</h2>
            <p className="mt-0.5 text-sm text-gray-500 tabular-nums">{formatCurrency(goal.saved)} of {formatCurrency(goal.targetAmount)} saved</p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} className="p-2 -mr-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-4">
          <label htmlFor="add-money-amount" className="text-sm font-semibold text-gray-900">Amount</label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
            <input id="add-money-amount" inputMode="decimal" value={amount} placeholder="100" autoFocus
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
              className="w-full rounded-xl border border-gray-200 bg-surface py-2 pl-7 pr-3 text-sm tabular-nums text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button type="button" onClick={() => submit(-1)} disabled={busy} className="btn-secondary text-sm">Take out</button>
          <button type="submit" disabled={busy} className="btn-primary text-sm flex items-center gap-2">
            {busy && <Loader className="w-4 h-4 animate-spin" aria-hidden />}
            Add money
          </button>
        </div>
      </form>
    </div>
  );
}
