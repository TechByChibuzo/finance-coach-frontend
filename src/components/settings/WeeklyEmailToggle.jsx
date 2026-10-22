import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { userAPI } from '../../services/api';

/**
 * Turns the Monday summary email on or off
 */
export default function WeeklyEmailToggle() {
  const [enabled, setEnabled] = useState(null);

  useEffect(() => {
    userAPI.me().then(({ data }) => setEnabled(data.weeklySummaryEmails)).catch(() => setEnabled(true));
  }, []);

  const change = async (next) => {
    setEnabled(next);
    try {
      await userAPI.updatePreferences({ weeklySummaryEmails: next });
      toast.success(next ? 'Weekly emails are on' : 'Weekly emails are off');
    } catch {
      setEnabled(!next);
      toast.error("Couldn't change the setting. Try again.");
    }
  };

  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3 cursor-pointer">
      <span>
        <span className="block text-sm font-semibold text-gray-900">Weekly summary email</span>
        <span className="block text-xs text-gray-500 mt-0.5">Every Monday: what you spent last week and the bills coming up.</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={Boolean(enabled)}
        disabled={enabled === null}
        onChange={(e) => change(e.target.checked)}
        className="peer sr-only"
      />
      <span aria-hidden className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-600 ${enabled ? 'bg-primary-600' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
      </span>
    </label>
  );
}
