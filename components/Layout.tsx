
import React from 'react';
import { User } from '../types';
import { dataService } from '../services/dataService';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activeView: 'offers' | 'transactions' | 'admin' | 'profile' | 'update' | 'notifications';
  setActiveView: (view: any) => void;
  onAddBalance: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeView, setActiveView, onAddBalance }) => {
  const notifications = dataService.getNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const config = dataService.getConfig();

  // Define nav items, including conditional admin tab
  const navItems = [
    { id: 'offers', label: 'হোম', icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3l9 8h-3v9h-12v-9h-3l9-8z" /></svg>
    ) },
    { id: 'transactions', label: 'লেনদেন', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
    ) },
    ...(user.role === 'admin' ? [{ id: 'admin', label: 'এডমিন', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    ) }] : []),
    { id: 'profile', label: 'প্রোফাইল', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    ) }
  ];

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-gray-50 relative flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 max-w-lg mx-auto bg-white px-4 py-4 flex justify-between items-center shadow-sm z-[100] border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src={config.logoUrl} className="w-9 h-9 object-contain rounded-lg" />
          <div>
            <h1 className="text-base font-black text-gray-800 leading-none uppercase tracking-tight" style={{ fontFamily: 'Hind Siliguri' }}>Telecom Bangla</h1>
            <p className="text-[9px] font-bold text-green-600 mt-1 uppercase tracking-widest">{user.role === 'admin' ? 'ADMIN ACCESS' : 'Premium Service'}</p>
          </div>
        </div>
        <button onClick={() => setActiveView('notifications')} className="relative p-2 text-gray-400 bg-gray-50 rounded-xl border border-gray-100 active:scale-95 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-24 pb-32">
        {children}
      </main>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-4 left-4 right-4 max-w-[calc(100%-2rem)] mx-auto bg-white/90 backdrop-blur-xl border border-gray-100 flex justify-around items-center py-4 rounded-[2.5rem] shadow-2xl z-[100]">
        {navItems.map((nav) => (
          <button 
            key={nav.id}
            onClick={() => setActiveView(nav.id as any)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeView === nav.id ? 'text-green-600 scale-110' : 'text-gray-400 opacity-60 hover:opacity-100'}`}
          >
            {nav.icon}
            <span className="text-[10px] font-black uppercase tracking-widest">{nav.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Layout;
