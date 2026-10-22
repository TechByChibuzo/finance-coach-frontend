import { Link, useLocation } from 'react-router-dom';
import { Bot, CreditCard, LayoutDashboard, Menu, PiggyBank } from 'lucide-react';

const TABS = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Budgets', href: '/budget', icon: PiggyBank },
  { name: 'Coach', href: '/ai-coach', icon: Bot },
];

/**
 * Bottom navigation on phones, where the sidebar is hidden. "More" opens the full menu.
 */
export default function MobileTabBar({ onMore }) {
  const { pathname } = useLocation();
  const item = 'flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold';

  return (
    <nav
      aria-label="Main"
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex">
        {TABS.map(({ name, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} to={href} className={`${item} ${active ? 'text-primary-700' : 'text-gray-500'}`}
              aria-current={active ? 'page' : undefined}>
              <Icon className="h-5 w-5" aria-hidden />
              {name}
            </Link>
          );
        })}
        <button type="button" onClick={onMore} className={`${item} text-gray-500`}>
          <Menu className="h-5 w-5" aria-hidden />
          More
        </button>
      </div>
    </nav>
  );
}
