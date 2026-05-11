import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Landmark,
  Bot,
  Crown,
  Settings,
  X,
} from 'lucide-react';

const mainNav = [
  { name: 'Dashboard',    href: '/dashboard',    icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions',  icon: CreditCard },
  { name: 'Budgets',      href: '/budget',        icon: PiggyBank },
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
    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm shadow-primary-200">
      <svg width="18" height="18" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M15 2L4 6.8V14.5C4 21.2 8.8 27.4 15 29C21.2 27.4 26 21.2 26 14.5V6.8L15 2Z"
          fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" strokeLinejoin="round"
        />
        <line x1="15" y1="9" x2="15" y2="22" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <path
          d="M18 12C18 10.9 16.7 10 15 10C13.3 10 12 10.9 12 12C12 13.1 13.3 13.8 15 14C16.7 14.2 18 15 18 16.2C18 17.4 16.7 18.2 15 18.2C13.3 18.2 12 17.3 12 16.2"
          stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"
        />
      </svg>
    </div>
    <span className="font-bold text-gray-900">Finance Coach</span>
  </div>
);

const NavItem = ({ item, isActive, onClose }) => (
  <Link
    to={item.href}
    onClick={onClose}
    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
    {item.name}
  </Link>
);

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

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
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
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
