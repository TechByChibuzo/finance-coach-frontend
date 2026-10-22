import { useEffect, useState } from 'react';
import { Loader, Plus, Trash2 } from 'lucide-react';
import { transactionsAPI } from '../../services/api';
import { CATEGORY_OPTIONS, editableCategory } from '../../utils/categories';
import { formatCurrency } from '../../utils/helpers';

const MAX_PARTS = 10;

// Money as whole cents, so the parts add up exactly
const toCents = (value) => {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
const fromCents = (cents) => (cents / 100).toFixed(2);

/**
 * Splits a purchase into parts with their own categories. Given a part of an existing split,
 * edits that split.
 */
export default function SplitEditor({ transaction, onBack, onSaved }) {
  const originalId = transaction.splitFromId || transaction.id;
  const [totalCents, setTotalCents] = useState(transaction.splitFromId ? null : Math.abs(toCents(transaction.amount)));
  const [sign] = useState(transaction.amount < 0 ? -1 : 1);
  const [rows, setRows] = useState(() => transaction.splitFromId ? [] : [
    { category: editableCategory(transaction), amount: fromCents(Math.abs(toCents(transaction.amount))) },
    { category: '', amount: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Editing an existing split: start from its parts, whose sum is the purchase amount
  useEffect(() => {
    if (!transaction.splitFromId) return;
    transactionsAPI.getSplit(originalId)
      .then(({ data }) => {
        setRows(data.map((p) => ({ category: editableCategory(p), amount: fromCents(Math.abs(toCents(p.amount))) })));
        setTotalCents(data.reduce((sum, p) => sum + Math.abs(toCents(p.amount)), 0));
      })
      .catch(() => setError("Couldn't load the split. Try again."));
  }, [transaction.splitFromId, originalId]);

  if (totalCents === null) {
    return <div className="flex justify-center py-10"><Loader className="w-5 h-5 animate-spin text-gray-400" aria-label="Loading" /></div>;
  }

  const assigned = rows.reduce((sum, r) => sum + toCents(r.amount), 0);
  const remaining = totalCents - assigned;
  const complete = rows.length >= 2 && remaining === 0 && rows.every((r) => r.category && toCents(r.amount) > 0);

  const update = (i, changes) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...changes } : r)));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await transactionsAPI.split(originalId, rows.map((r) => ({ category: r.category, amount: (sign * toCents(r.amount)) / 100 })));
      onSaved();
    } catch (err) {
      setError(err.response?.status === 400 && err.response.data?.message
        ? err.response.data.message
        : "Couldn't save the split. Try again.");
      setSaving(false);
    }
  };

  return (
    <>
      <div className="px-6 py-4 space-y-3">
        <p className="text-sm text-gray-600">
          Divide the {formatCurrency(totalCents / 100)} between categories. Each part is counted in its own category.
        </p>
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <label className="sr-only" htmlFor={`split-category-${i}`}>Category for part {i + 1}</label>
            <select id={`split-category-${i}`} value={r.category} onChange={(e) => update(i, { category: e.target.value })}
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-surface px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="">Choose a category</option>
              {CATEGORY_OPTIONS.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
            </select>
            <label className="sr-only" htmlFor={`split-amount-${i}`}>Amount for part {i + 1}</label>
            <div className="relative w-28 shrink-0">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input id={`split-amount-${i}`} inputMode="decimal" value={r.amount} placeholder="0.00"
                onChange={(e) => update(i, { amount: e.target.value.replace(/[^\d.]/g, '') })}
                className="w-full rounded-xl border border-gray-200 bg-surface py-2 pl-7 pr-3 text-right text-sm tabular-nums text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
            <button type="button" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} disabled={rows.length <= 2}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:invisible" aria-label={`Remove part ${i + 1}`}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setRows((rs) => [...rs, { category: '', amount: remaining > 0 ? fromCents(remaining) : '' }])}
            disabled={rows.length >= MAX_PARTS}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-50">
            <Plus className="w-4 h-4" aria-hidden />
            Add a part
          </button>
          <p className={`text-sm tabular-nums ${remaining === 0 ? 'text-gray-500' : 'font-semibold text-amber-600'}`} aria-live="polite">
            {remaining === 0 ? 'All assigned' : remaining > 0 ? `${formatCurrency(remaining / 100)} left` : `${formatCurrency(-remaining / 100)} over`}
          </p>
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </div>

      <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
        <button onClick={onBack} disabled={saving} className="btn-secondary text-sm">Back</button>
        <button onClick={save} disabled={saving || !complete} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
          {saving && <Loader className="w-4 h-4 animate-spin" aria-hidden />}
          Save split
        </button>
      </div>
    </>
  );
}
