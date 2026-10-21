import { Link } from 'react-router-dom';

export const LogoMark = ({ className = 'w-9 h-9' }) => (
  <div className={`${className} bg-primary-600 rounded-xl flex items-center justify-center`}>
    <svg width="18" height="18" viewBox="0 0 30 30" fill="none" aria-hidden>
      <path d="M15 2L4 6.8V14.5C4 21.2 8.8 27.4 15 29C21.2 27.4 26 21.2 26 14.5V6.8L15 2Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="15" y1="9" x2="15" y2="22" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 12C18 10.9 16.7 10 15 10C13.3 10 12 10.9 12 12C12 13.1 13.3 13.8 15 14C16.7 14.2 18 15 18 16.2C18 17.4 16.7 18.2 15 18.2C13.3 18.2 12 17.3 12 16.2" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  </div>
);

// A glimpse of the dashboard's lead card, so people see what they're signing up for
function PacePreview() {
  return (
    <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 p-6 max-w-sm">
      <p className="text-sm text-primary-100/80">Spent so far this month</p>
      <p className="mt-1 text-4xl font-extrabold tracking-tight text-white">$1,284</p>
      <p className="mt-2 text-sm text-primary-200">$410 less than this point last month.</p>
      <svg viewBox="0 0 300 80" className="mt-5 w-full h-20" aria-hidden>
        <path d="M0 74 C40 70 70 66 100 58 S160 44 190 40 S250 30 300 18" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeDasharray="5 5" />
        <path d="M0 76 C40 73 70 70 100 64 S150 56 180 52" fill="none" stroke="#7cc3b5" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden lg:flex flex-col justify-between bg-primary-900 px-12 py-10">
        <Link to="/" className="flex items-center gap-2.5 w-fit">
          <LogoMark />
          <span className="font-bold text-white">Finance Coach</span>
        </Link>
        <div>
          <p className="text-4xl font-extrabold leading-tight tracking-tight text-white max-w-md">
            Know where your money goes, and what to do about it.
          </p>
          <p className="mt-4 text-base text-primary-100/80 max-w-md">
            Link your accounts, set budgets, and ask a coach that answers with your real numbers.
          </p>
          <div className="mt-10"><PacePreview /></div>
        </div>
        <p className="text-xs text-primary-100/60">© {new Date().getFullYear()} Finance Coach</p>
      </aside>

      <main className="flex min-h-screen lg:min-h-0 flex-col justify-center px-4 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2.5 mb-10 lg:hidden w-fit">
            <LogoMark />
            <span className="font-bold text-gray-900">Finance Coach</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-gray-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-sm text-gray-600">{footer}</div>}
          <p className="mt-10 text-xs text-gray-400">
            Banks connect through Plaid. Finance Coach never sees your bank password.
          </p>
        </div>
      </main>
    </div>
  );
}

// Shared field styling for the auth forms
export const inputClass =
  'w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60';
