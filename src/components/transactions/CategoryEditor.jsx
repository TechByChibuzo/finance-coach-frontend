import { useEffect, useState } from 'react';
import { Loader, X } from 'lucide-react';
import { transactionsAPI } from '../../services/api';
import { CATEGORY_OPTIONS, editableCategory } from '../../utils/categories';
import { formatCurrency } from '../../utils/helpers';

export default function CategoryEditor({ transaction, onClose, onSaved }) {
  const merchant = transaction.merchantName || transaction.name;
  const [category, setCategory] = useState(editableCategory(transaction));
  const [remember, setRemember] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !saving && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, saving]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const { data } = await transactionsAPI.updateCategory(transaction.id, category, remember);
      onSaved(data, remember);
      onClose();
    } catch (err) {
      console.error('Category update failed:', err);
      setError("Couldn't change the category. Try again.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/50 sm:p-4" role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="category-title"
        className="w-full sm:max-w-md max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-surface shadow-xl">
        <div className="flex items-start justify-between gap-3 px-6 pt-5">
          <div className="min-w-0">
            <h2 id="category-title" className="text-lg font-bold text-gray-900">Change category</h2>
            <p className="mt-0.5 text-sm text-gray-500 truncate">
              {merchant}, {formatCurrency(Math.abs(transaction.amount))}
            </p>
          </div>
          <button onClick={onClose} disabled={saving} className="p-2 -mr-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <fieldset className="px-6 py-4">
          <legend className="sr-only">Category</legend>
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
        </fieldset>

        <div className="px-6 pb-2">
          <label className="flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3 cursor-pointer">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-700">
              Always use this for <span className="font-semibold text-gray-900">{merchant}</span>
              <span className="block text-xs text-gray-500 mt-0.5">Updates past transactions from this merchant and new ones as they arrive.</span>
            </span>
          </label>
          {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4">
          <button onClick={onClose} disabled={saving} className="btn-secondary text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
            {saving && <Loader className="w-4 h-4 animate-spin" aria-hidden />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
