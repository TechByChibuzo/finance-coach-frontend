import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileTabBar from './MobileTabBar';
import ReconnectBanner from './ReconnectBanner';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex pt-16">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <main className="flex-1 min-w-0 px-4 pt-6 pb-28 sm:px-6 sm:pt-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <ReconnectBanner />
            {children}
          </div>
        </main>
      </div>
      <MobileTabBar onMore={() => setSidebarOpen(true)} />
    </div>
  );
}