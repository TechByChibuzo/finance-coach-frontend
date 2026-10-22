import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { categoryRulesAPI } from '../../services/api';
import { categoryLabel } from '../../utils/categories';

export default function CategoryRules() {
  const [rules, setRules] = useState(null);

  useEffect(() => {
    categoryRulesAPI.list()
      .then(({ data }) => setRules(data))
      .catch(() => { setRules([]); toast.error("Couldn't load your category rules."); });
  }, []);

  const remove = async (rule) => {
    setRules((current) => current.filter((r) => r.id !== rule.id));
    try {
      await categoryRulesAPI.remove(rule.id);
    } catch {
      toast.error("Couldn't remove the rule. Try again.");
      setRules((current) => [...current, rule]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Category rules</h2>
        <p className="mt-1 text-sm text-gray-600 max-w-xl">
          Created when you change a transaction's category and choose to always use it for that merchant.
          New transactions from these merchants get the same category. Removing a rule doesn't change
          transactions it already updated.
        </p>
      </div>
      {rules === null ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : rules.length === 0 ? (
        <p className="text-sm text-gray-500">
          No rules yet. On the Transactions page, tap a transaction to change its category.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 px-4">
          {rules.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{r.merchant}</p>
                <p className="text-xs text-gray-500">
                  {categoryLabel(r.category)}
                </p>
              </div>
              <button onClick={() => remove(r)} className="text-sm font-semibold text-gray-500 hover:text-red-600 shrink-0">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
