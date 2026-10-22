// Small drawings for empty states, in one style: rounded shapes in the brand greens on a soft
// ground shadow. Colours come from theme tokens, so they follow light and dark mode.

const DEEP = 'var(--color-primary-600)';
const MID = 'var(--color-primary-300)';
const PALE = 'var(--color-primary-100)';
const PAPER = 'var(--color-surface)';
const LINE = 'var(--color-gray-200)';
const GROUND = 'var(--color-gray-200)';

const Ground = () => <ellipse cx="80" cy="104" rx="56" ry="5" fill={GROUND} opacity="0.7" />;

const drawings = {
  // Two receipts and a coin
  transactions: (
    <>
      <Ground />
      <g transform="rotate(-8 64 56)">
        <rect x="34" y="18" width="52" height="72" rx="8" fill={PALE} />
      </g>
      <rect x="58" y="22" width="56" height="76" rx="8" fill={PAPER} stroke={LINE} strokeWidth="2" />
      <rect x="68" y="36" width="28" height="5" rx="2.5" fill={MID} />
      <rect x="68" y="50" width="36" height="4" rx="2" fill={LINE} />
      <rect x="68" y="60" width="30" height="4" rx="2" fill={LINE} />
      <rect x="68" y="70" width="34" height="4" rx="2" fill={LINE} />
      <rect x="68" y="84" width="20" height="5" rx="2.5" fill={DEEP} />
      <circle cx="118" cy="86" r="13" fill={DEEP} />
      <circle cx="118" cy="86" r="8" fill="none" stroke={PALE} strokeWidth="2" />
    </>
  ),
  // A jar of coins: money set aside for a purpose
  budgets: (
    <>
      <Ground />
      <rect x="52" y="20" width="56" height="10" rx="4" fill={DEEP} />
      <path d="M56 32h48v56a12 12 0 0 1-12 12H68a12 12 0 0 1-12-12V32z" fill={PAPER} stroke={LINE} strokeWidth="2" />
      <rect x="64" y="78" width="32" height="10" rx="5" fill={DEEP} />
      <rect x="66" y="66" width="28" height="10" rx="5" fill={MID} />
      <rect x="64" y="54" width="32" height="10" rx="5" fill={PALE} />
      <circle cx="122" cy="44" r="9" fill={MID} />
      <circle cx="38" cy="62" r="6" fill={PALE} />
    </>
  ),
  // A calendar page with a repeat arrow
  recurring: (
    <>
      <Ground />
      <rect x="40" y="24" width="72" height="72" rx="10" fill={PAPER} stroke={LINE} strokeWidth="2" />
      <path d="M40 34a10 10 0 0 1 10-10h52a10 10 0 0 1 10 10v8H40z" fill={DEEP} />
      <rect x="56" y="16" width="6" height="16" rx="3" fill={MID} />
      <rect x="90" y="16" width="6" height="16" rx="3" fill={MID} />
      {[0, 1, 2, 3].map((c) => [0, 1].map((r) => (
        <rect key={`${c}-${r}`} x={50 + c * 14} y={52 + r * 14} width="8" height="8" rx="2"
          fill={c === 2 && r === 1 ? DEEP : LINE} />
      )))}
      <circle cx="116" cy="84" r="16" fill={PALE} />
      <path d="M108 84a8 8 0 1 0 2.5-5.8" fill="none" stroke={DEEP} strokeWidth="3" strokeLinecap="round" />
      <path d="M109 74v5h5" fill="none" stroke={DEEP} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // A flag at the top of a gentle hill, with a path up to it
  goals: (
    <>
      <Ground />
      <path d="M20 100c22-30 44-46 66-46s40 20 54 46z" fill={PALE} />
      <path d="M40 98c10-6 18-12 26-20s16-14 22-18" fill="none" stroke={MID} strokeWidth="3"
        strokeDasharray="1 7" strokeLinecap="round" />
      <rect x="86" y="20" width="4" height="42" rx="2" fill={DEEP} />
      <path d="M90 22h28l-7 9 7 9H90z" fill={DEEP} />
      <circle cx="40" cy="98" r="5" fill={DEEP} />
    </>
  ),
  // Rising bars with a line climbing past them
  investments: (
    <>
      <Ground />
      <rect x="36" y="70" width="16" height="30" rx="4" fill={PALE} />
      <rect x="60" y="56" width="16" height="44" rx="4" fill={MID} />
      <rect x="84" y="42" width="16" height="58" rx="4" fill={PALE} />
      <rect x="108" y="28" width="16" height="72" rx="4" fill={MID} />
      <path d="M32 62l26-14 24 6 36-30" fill="none" stroke={DEEP} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="118" cy="24" r="6" fill={DEEP} />
    </>
  ),
  // A bank with a link to it
  banks: (
    <>
      <Ground />
      <path d="M44 42l36-20 36 20z" fill={DEEP} />
      <rect x="44" y="42" width="72" height="6" rx="2" fill={MID} />
      {[52, 68, 84, 100].map((x) => <rect key={x} x={x} y="52" width="8" height="34" rx="3" fill={PALE} />)}
      <rect x="40" y="88" width="80" height="8" rx="3" fill={DEEP} />
      <circle cx="126" cy="40" r="14" fill={PAPER} stroke={LINE} strokeWidth="2" />
      <path d="M120 40h12M126 34v12" stroke={DEEP} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
};

/**
 * One of the empty-state drawings, by name: transactions, budgets, recurring, goals,
 * investments or banks
 */
export default function Illustration({ name, className = 'h-28 w-40' }) {
  return (
    <svg viewBox="0 0 160 112" className={className} aria-hidden focusable="false">
      {drawings[name]}
    </svg>
  );
}
