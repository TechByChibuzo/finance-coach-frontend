import { Link } from 'react-router-dom';
import { Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentSubscription } from '../../hooks/useSubscription';

import { 
  Bars3Icon, 
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { data: subscription } = useCurrentSubscription();
  const planName = subscription?.planName || 'FREE';


  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <Link to="/dashboard" className="flex items-center ml-2">
              <span className="text-2xl">💰</span>
              <span className="ml-2 text-xl font-bold text-sky-600 hidden sm:block">
                Finance Coach
              </span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* NEW: Plan Badge */}
            {planName === 'FREE' ? (
              <Link
                to="/pricing"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700 transition-all shadow-sm hover:shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade</span>
              </Link>
            ) : (
              <Link
                to="/settings/billing"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-100 transition-colors border border-primary-200"
              >
                {planName === 'PRO' ? (
                  <Crown className="w-3.5 h-3.5 text-primary-600" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                )}
                <span>{planName}</span>
              </Link>
            )}
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* User info - hidden on small screens */}
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              {/* User icon - visible on all screens */}
              <div className="p-2 text-gray-400">
                <UserCircleIcon className="h-8 w-8" />
              </div>
              
              {/* Logout button */}
              <button
                onClick={logout}
                className="flex items-center space-x-1 sm:space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span className="hidden sm:inline text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}