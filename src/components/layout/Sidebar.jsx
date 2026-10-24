import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogoMark } from '../common/Logo';
import {
  LayoutDashboard,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Landmark,
  Bot,
  Repeat,
  BarChart3,
  Target,
  Crown,
  Settings,
  X,
} from 'lucide-react';

const mainNav = [
  { name: 'Dashboard',    href: '/dashboard',    icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions',  icon: CreditCard },
  { name: 'Budgets',      href: '/budget',        icon: PiggyBank },
  { name: 'Recurring',    href: '/recurring',     icon: Repeat },
  { name: 'Reports',      href: '/reports',       icon: BarChart3 },
  { name: 'Goals',        href: '/goals',         icon: Target },
  { name: 'Investments',  href: '/investments',   icon: TrendingUp },
  { name: 'Net Worth',    href: '/net-worth',     icon: Landmark },
  { name: 'AI Coach',     href: '/ai-coach',      icon: Bot },
];

const secondaryNav = [
  { name: 'Pricing',  href: '/pricing',  icon: Crown },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <LogoMark className="w-8 h-8 rounded-lg" size={20} />
    <span className="font-bold text-gray-900">Finance Coach</span>
  </div>
);

const NavItem = ({ item, isActive, onClose }) => (
  <Link
    to={item.href}
    onClick={onClose}
    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700 font-semibold'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
    {item.name}
  </Link>
);

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  // Escape closes the mobile menu, like any other overlay
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-gray-100 flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:self-start lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 lg:hidden">
          <Logo />
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Desktop top spacing to clear fixed navbar */}
        <div className="hidden lg:block h-4" />

        {/* Main navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {mainNav.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              isActive={location.pathname === item.href}
              onClose={onClose}
            />
          ))}

          {/* Separator */}
          <div className="pt-4 pb-2">
            <div className="border-t border-gray-100" />
          </div>

          {secondaryNav.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              isActive={location.pathname === item.href}
              onClose={onClose}
            />
          ))}
        </nav>
      </div>
    </>
  );
}
