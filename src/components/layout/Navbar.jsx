import { Link } from 'react-router-dom';
import { Crown, Sparkles, ChevronDown, Menu, Bell, UserCircle, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentSubscription } from '../../hooks/useSubscription';
import { useState, useRef, useEffect } from 'react';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { data: subscription } = useCurrentSubscription();
  const planName = subscription?.planName || 'FREE';
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user initials
  const getUserInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm fixed w-full z-30 top-0">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <Link to="/dashboard" className="flex items-center ml-2 space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm shadow-primary-200">
                <svg width="22" height="22" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <span className="text-lg font-bold text-gray-900 hidden sm:block">Finance Coach</span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Plan Badge */}
            {planName === 'FREE' ? (
              <Link
                to="/pricing"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade to Pro</span>
              </Link>
            ) : (
              <Link
                to="/settings/billing"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-lg text-sm font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-sm hover:shadow-md"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{planName}</span>
              </Link>
            )}

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            {/* Divider */}
            <div className="hidden md:block h-8 w-px bg-gray-200"></div>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 sm:space-x-3 hover:bg-gray-50 rounded-lg px-2 sm:px-3 py-2 transition-colors"
              >
                {/* User info - hidden on small screens */}
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                
                {/* User Avatar */}
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-white">
                  {getUserInitials()}
                </div>

                {/* Chevron - hidden on mobile */}
                <ChevronDown className={`hidden sm:block w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl ring-1 ring-gray-900/5 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {getUserInitials()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/settings/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                    >
                      <UserCircle className="w-4 h-4 text-gray-400" />
                      <span>Profile Settings</span>
                    </Link>

                    <Link
                      to="/settings/billing"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Crown className="w-4 h-4 text-gray-400" />
                      <span>Billing & Subscription</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}