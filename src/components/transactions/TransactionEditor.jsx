import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Loader, Split, X } from 'lucide-react';
import { transactionsAPI } from '../../services/api';
import { CATEGORY_OPTIONS, editableCategory } from '../../utils/categories';
import { formatCurrency } from '../../utils/helpers';
import SplitEditor from './SplitEditor';

/**
 * Category, note, hiding from totals, and splitting for one transaction. onChanged runs after
 * anything was saved, so the list can reload.
 */
export default function TransactionEditor({ transaction, onClose, onChanged }) {
  const merchant = transaction.merchantName || transaction.name;
  const isPart = Boolean(transaction.splitFromId);
  const initialCategory = editableCategory(transaction);
  const [view, setView] = useState('details');
  const [category, setCategory] = useState(initialCategory);
  const [remember, setRemember] = useState(false);
  const [notes, setNotes] = useState(transaction.notes || '');
  const [hidden, setHidden] = useState(Boolean(transaction.hidden));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !saving && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, saving]);

  const run = async (action, failure) => {
    setSaving(true);
    setError(null);
    try {
      await action();
      onChanged();
      onClose();
    } catch (err) {
      console.error(failure, err);
      setError(err.response?.status === 400 && err.response.data?.message ? err.response.data.message : failure);
      setSaving(false);
    }
  };

  const save = () => run(async () => {
    if (category !== initialCategory || remember) {
      await transactionsAPI.updateCategory(transaction.id, category, remember);
    }
    const notesChanged = notes.trim() !== (transaction.notes || '');
    if (notesChanged || hidden !== Boolean(transaction.hidden)) {
      await transactionsAPI.update(transaction.id, { notes: notes.trim(), hidden });
    }
  }, "Couldn't save the changes. Try again.");

  const undoSplit = () => run(() => transactionsAPI.unsplit(transaction.id), "Couldn't undo the split. Try again.");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/50 sm:p-4" role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="transaction-title"
        className="w-full sm:max-w-md max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-surface shadow-xl">
        <div className="flex items-start justify-between gap-3 px-6 pt-5">
          <div className="min-w-0">
            <h2 id="transaction-title" className="text-lg font-bold text-gray-900 truncate">
              {view === 'split' ? 'Split transaction' : merchant}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500 truncate">
              {view === 'split'
                ? merchant
                : `${format(parseISO(transaction.date), 'MMM d, yyyy')}, ${formatCurrency(Math.abs(transaction.amount))}`}
            </p>
          </div>
          <button onClick={onClose} disabled={saving} className="p-2 -mr-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {view === 'split' ? (
          <SplitEditor
            transaction={transaction}
            onBack={() => setView('details')}
            onSaved={() => { onChanged(); onClose(); }}
          />
        ) : (
          <>
            {isPart && (
              <div className="mx-6 mt-4 flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-sm text-gray-700">Part of a split purchase</p>
                <div className="flex gap-3 shrink-0">
                  <button onClick={() => setView('split')} disabled={saving} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                    Edit split
                  </button>
                  <button onClick={undoSplit} disabled={saving} className="text-sm font-semibold text-gray-500 hover:text-gray-700">
                    Undo split
                  </button>
                </div>
              </div>
            )}

            <fieldset className="px-6 py-4">
              <legend className="mb-2 text-sm font-semibold text-gray-900">Category</legend>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_OPTIONS.map((o) => (
                  <label key={o.code}
                    className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm ${category === o.code ? 'border-primary-500 bg-primary-50 font-semibold text-primary-800' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                    <input type="radio" name="category" value={o.code} checked={category === o.code}
                      onChange={() => setCategory(o.code)} className="sr-only" />
                    {o.label}
                  </label>
                ))}
              </div>
              {!isPart && (
                <label className="mt-3 flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-gray-700">
                    Always use this for <span className="font-semibold text-gray-900">{merchant}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">Updates past transactions from this merchant and new ones as they arrive.</span>
                  </span>
                </label>
              )}
            </fieldset>

            <div className="px-6 pb-4">
              <label htmlFor="transaction-notes" className="text-sm font-semibold text-gray-900">Note</label>
              <textarea id="transaction-notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} rows={2}
                placeholder="Add a note"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-surface px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />

              <label className="mt-3 flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-700">
                  Hide from totals
                  <span className="block text-xs text-gray-500 mt-0.5">It stays in your list but isn't counted in spending, budgets or reports.</span>
                </span>
              </label>
              {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
            </div>

            <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-100">
              {!isPart && (
                <button onClick={() => setView('split')} disabled={saving}
                  className="mr-auto flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900">
                  <Split className="w-4 h-4" aria-hidden />
                  Split
                </button>
              )}
              <button onClick={onClose} disabled={saving} className={`btn-secondary text-sm ${isPart ? 'ml-auto' : ''}`}>Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                {saving && <Loader className="w-4 h-4 animate-spin" aria-hidden />}
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
