import { useState } from 'react';

/**
 * The bank's logo from Plaid; otherwise its initial on the bank's brand colour; otherwise the
 * fallback passed in (the account-type icon). A logo that fails to load drops to the next option.
 */
export default function BankLogo({ logo, color, name, fallback }) {
  const [failed, setFailed] = useState(false);

  if (logo && !failed) {
    return (
      <img
        src={logo}
        alt=""
        onError={() => setFailed(true)}
        className="w-10 h-10 shrink-0 rounded-xl bg-surface object-contain p-1 ring-1 ring-gray-200"
      />
    );
  }
  if (color && name) {
    return (
      <div
        className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold text-white"
        style={{ backgroundColor: color }}
        aria-hidden
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return fallback;
}
