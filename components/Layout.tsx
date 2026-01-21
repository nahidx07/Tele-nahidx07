
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

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-white relative pb-28 overflow-x-hidden">
      <header className="bg-white px-4 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src={config.logoUrl} className="w-10 h-10 object-contain rounded-lg shadow-sm" />
          <div>
            <h1 className="text-base font-bold text-gray-800 leading-none" style={{ fontFamily: 'Hind Siliguri' }}>Telicom Bangla</h1>
            <div className="mt-1 flex items-center bg-yellow-400 rounded-md px-2 py-0.5 gap-1 shadow-sm">
              <span className="text-[10px]">👑</span>
              <span className="text-[11px] font-bold text-gray-900">স্বাধীন</span>
            </div>
          </div>
        </div>
        <button onClick={() => setActiveView('notifications')} className="relative p-2 text-gray-500">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
        </button>
      </header>

      <main className="flex-1 px-4 pt-2 overflow-y-auto">
        {children}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 z-50">
        {[
          { id: 'offers', label: 'হোম', icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3l9 8h-3v9h-12v-9h-3l9-8z" /></svg>
          ) },
          { id: 'transactions', label: 'লেনদেন', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          ) },
          { id: 'update', label: 'Update', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v8" /></svg>
          ) },
          { id: 'profile', label: 'প্রোফাইল', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          ) }
        ].map((nav) => (
          <button 
            key={nav.id}
            onClick={() => setActiveView(nav.id as any)}
            className={`flex flex-col items-center gap-1 transition-all ${activeView === nav.id ? 'text-green-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {nav.icon}
            <span className="text-[11px] font-bold">{nav.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Layout;
