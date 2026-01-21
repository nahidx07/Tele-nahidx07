
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activeView: 'offers' | 'transactions' | 'admin' | 'profile' | 'update' | 'notifications';
  setActiveView: (view: any) => void;
  onAddBalance: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeView, setActiveView, onAddBalance }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-gray-50/50 shadow-[0_0_100px_rgba(0,0,0,0.02)] relative pb-28 overflow-x-hidden">
      {/* App Header with New Gradient Style */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5 flex justify-between items-center sticky top-0 z-50 shadow-lg shadow-green-900/10">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
            <svg className="w-6 h-6 text-green-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">
              Telicom <span className="text-yellow-400">Bangla</span>
            </h1>
            <div className="mt-1 flex">
              <div className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 border border-white/10 uppercase tracking-widest">
                <span className="text-yellow-400">👑</span> প্রিমিয়াম
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user.role === 'admin' && activeView !== 'admin' && (
             <button 
               onClick={() => setActiveView('admin')} 
               className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all border border-white/10 active:scale-95"
             >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
             </button>
          )}
          <button 
            onClick={() => setActiveView('notifications')}
            className={`p-2.5 rounded-2xl relative border transition-all active:scale-95 ${activeView === 'notifications' ? 'bg-white text-green-700 border-white' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 ${activeView === 'notifications' ? 'bg-red-500 border-white' : 'bg-red-500 border-green-700'}`}></div>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-5 pt-6 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 flex justify-around items-center p-2.5 z-50">
        {[
          { id: 'offers', label: 'হোম', icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          ) },
          { id: 'transactions', label: 'লেনদেন', icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          ) },
          { id: 'update', label: 'Update', icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
          ) },
          { id: 'profile', label: 'প্রোফাইল', icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          ) }
        ].map((nav) => (
          <button 
            key={nav.id}
            onClick={() => setActiveView(nav.id as any)}
            className={`flex flex-col items-center gap-1.5 px-6 py-2 rounded-[2rem] transition-all duration-300 ${activeView === nav.id ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {nav.icon}
            <span className={`text-[10px] font-black uppercase tracking-widest ${activeView === nav.id ? 'block' : 'hidden'}`}>{nav.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Layout;
