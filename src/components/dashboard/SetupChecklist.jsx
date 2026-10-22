import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';

const DISMISSED_KEY = 'setupChecklistDismissed';

const readDismissed = () => {
  try { return localStorage.getItem(DISMISSED_KEY) === '1'; } catch { return false; }
};

/**
 * First-run steps for new users. Each one ticks off from real data, and the card goes away
 * once everything is done (or the user dismisses it).
 */
export default function SetupChecklist({ hasTransactions, hasBudgets, hasAskedCoach }) {
  const [dismissed, setDismissed] = useState(readDismissed);

  const steps = [
    { done: hasTransactions, label: 'Bring in your transactions', hint: 'Connect a bank, or import a CSV file from your bank.', to: '/settings?tab=banks', action: 'Connect a bank' },
    { done: hasBudgets, label: 'Set a budget', hint: 'Start from a suggested amount based on your spending.', to: '/budget', action: 'Set a budget' },
    { done: hasAskedCoach, label: 'Ask the coach a question', hint: 'For example: "Where did most of my money go last month?"', to: '/ai-coach', action: 'Ask the coach' },
  ];
  const remaining = steps.filter((s) => !s.done).length;

  if (dismissed || remaining === 0) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISSED_KEY, '1'); } catch { /* still hide it for this visit */ }
    setDismissed(true);
  };

  return (
    <section className="card" aria-labelledby="setup-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="setup-heading" className="text-base font-bold text-gray-900">Get set up</h2>
          <p className="mt-0.5 text-sm text-gray-500">{3 - remaining} of 3 done</p>
        </div>
        <button onClick={dismiss} className="p-1.5 -mr-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Hide setup steps">
          <X className="w-4 h-4" />
        </button>
      </div>
      <ol className="mt-4 divide-y divide-gray-100">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-3 py-3">
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${s.done ? 'bg-primary-600 text-white' : 'border-2 border-gray-300'}`} aria-hidden>
              {s.done && <Check className="h-3.5 w-3.5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold ${s.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{s.label}</p>
              {!s.done && <p className="text-xs text-gray-500">{s.hint}</p>}
            </div>
            {!s.done && (
              <Link to={s.to} className="shrink-0 text-sm font-semibold text-primary-600 hover:text-primary-700">{s.action}</Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
