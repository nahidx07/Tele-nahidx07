
import React, { useState, useEffect, useMemo } from 'react';
import { Offer, Order, User, Operator, AppConfig } from './types';
import { dataService } from './services/dataService';
import { firebaseAuth } from './services/firebase';
import Layout from './components/Layout';
import OfferModal from './components/OfferModal';
import AdminDashboard from './components/AdminDashboard';
import Transactions from './components/Transactions';
import AddMoneyView from './components/AddMoneyView';
import ProfileView from './components/ProfileView';
import NotificationsView from './components/NotificationsView';
import UpdateView from './components/UpdateView';
import { OPERATORS, STORAGE_KEYS } from './constants';

type SubView = 'home' | 'offer-list' | 'add-money' | 'recharge' | 'transfer' | 'referral';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<'offers' | 'transactions' | 'admin' | 'profile' | 'notifications' | 'update'>('offers');
  const [subView, setSubView] = useState<SubView>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('ড্রাইভ');
  const [selectedOperator, setSelectedOperator] = useState<Operator | 'All'>('All');
  const [purchasingOffer, setPurchasingOffer] = useState<Offer | null>(null);
  
  const appConfig = dataService.getConfig();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authData, setAuthData] = useState({ name: '', phone: '', email: '', password: '', referralCode: '' });

  const refreshData = () => {
    setUser(dataService.getUser());
  };

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.expand();
      tg.ready();
      const tgUser = tg.initDataUnsafe?.user;
      const startParam = tg.initDataUnsafe?.start_param; // Telegram Referral Parameter

      if (tgUser) {
        const users = dataService.getUsers();
        let dbUser = users.find(u => u.telegramId === String(tgUser.id));
        if (!dbUser) {
          dbUser = {
            id: `tg_${tgUser.id}`,
            name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
            phone: '',
            balance: 0,
            role: 'user',
            telegramId: String(tgUser.id),
            avatarUrl: tgUser.photo_url || undefined,
            referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            referredBy: startParam || undefined // Auto referral from telegram link
          };
          dataService.updateUser(dbUser);
        }
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(dbUser));
        setUser(dbUser);
        setShowSplash(false);
        return;
      }
    }
    const splashTimer = setTimeout(() => setShowSplash(false), 2000);
    refreshData();
    return () => clearTimeout(splashTimer);
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (authMode === 'register') {
        const res = await firebaseAuth.register(authData.email, authData.password);
        const newUser: User = { 
          id: res.user.uid, 
          name: authData.name, 
          phone: authData.phone, 
          email: authData.email, 
          balance: 0, 
          role: 'user',
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          referredBy: authData.referralCode || undefined // Manual Referral Code
        };
        dataService.updateUser(newUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        setUser(newUser);
      } else {
        const res = await firebaseAuth.login(authData.email, authData.password);
        const users = dataService.getUsers();
        let dbUser = users.find(u => u.email === authData.email);
        if (!dbUser) {
          dbUser = { id: res.user.uid, name: res.user.displayName || 'User', phone: '', email: authData.email, balance: 0, role: 'user', referralCode: 'NEW' };
          dataService.updateUser(dbUser);
        }
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(dbUser));
        setUser(dbUser);
      }
    } catch (error: any) { alert(error.message); }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await firebaseAuth.loginWithGoogle();
      const users = dataService.getUsers();
      let dbUser = users.find(u => u.email === res.user.email);
      if (!dbUser) {
        dbUser = { 
          id: res.user.uid, 
          name: res.user.displayName || 'User', 
          phone: '', 
          email: res.user.email || '', 
          balance: 0, 
          role: 'user',
          avatarUrl: res.user.photoURL || undefined,
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase()
        };
        dataService.updateUser(dbUser);
      }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(dbUser));
      setUser(dbUser);
    } catch (error: any) { alert('গুগল লগইন ব্যর্থ হয়েছে।'); }
  };

  const filteredOffers = useMemo(() => {
    const offers = dataService.getOffers();
    let result = offers.filter(o => o.isActive);
    if (selectedOperator !== 'All') result = result.filter(o => o.operator === selectedOperator);
    result = result.filter(o => o.category === selectedCategory as any);
    return result;
  }, [selectedOperator, selectedCategory]);

  if (showSplash) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <img src={appConfig.logoUrl} className="w-24 h-24 object-contain animate-bounce rounded-xl" />
        <h2 className="mt-6 text-xl font-bold text-gray-800 tracking-tight">Telecom Bangla</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-sm space-y-6 animate-in fade-in">
           <div className="text-center space-y-2">
              <img src={appConfig.logoUrl} className="w-16 h-16 mx-auto mb-4 rounded-xl shadow-lg" />
              <h1 className="text-3xl font-black text-green-600">Telecom Bangla</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{authMode === 'login' ? 'স্বাগতম!' : 'নতুন একাউন্ট খুলুন'}</p>
           </div>
           <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-black/5 border border-gray-100 space-y-4">
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'register' && (
                    <>
                      <input placeholder="পুরো নাম" className="w-full bg-gray-50 p-4 rounded-xl text-sm font-bold border border-gray-100 outline-none focus:border-green-500" value={authData.name} onChange={e => setAuthData({...authData, name: e.target.value})} required />
                      <input placeholder="ফোন নম্বর" type="tel" className="w-full bg-gray-50 p-4 rounded-xl text-sm font-bold border border-gray-100 outline-none focus:border-green-500" value={authData.phone} onChange={e => setAuthData({...authData, phone: e.target.value})} required />
                      <input placeholder="রেফার কোড (ঐচ্ছিক)" className="w-full bg-gray-50 p-4 rounded-xl text-sm font-bold border border-gray-100 outline-none focus:border-blue-500" value={authData.referralCode} onChange={e => setAuthData({...authData, referralCode: e.target.value})} />
                    </>
                  )}
                  <input placeholder="ইমেইল" type="email" className="w-full bg-gray-50 p-4 rounded-xl text-sm font-bold border border-gray-100 outline-none focus:border-green-500" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} required />
                  <input placeholder="পাসওয়ার্ড" type="password" className="w-full bg-gray-50 p-4 rounded-xl text-sm font-bold border border-gray-100 outline-none focus:border-green-500" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} required />
                  <button type="submit" className="w-full py-4 bg-green-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">
                    {authMode === 'login' ? 'লগইন' : 'রেজিস্ট্রেশন'}
                  </button>
              </form>
              
              <div className="relative py-2">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                 <div className="relative flex justify-center text-[10px] uppercase font-black text-gray-300 bg-white px-2">অথবা</div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                className="w-full py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-[13px] flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] transition-all hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google দিয়ে লগইন
              </button>
           </div>
           <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="w-full text-xs font-bold text-blue-600 underline text-center">
             {authMode === 'login' ? 'একাউন্ট নেই? সাইন আপ করুন' : 'পুরানো একাউন্ট আছে? লগইন করুন'}
           </button>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} onLogout={() => { firebaseAuth.logout(); setUser(null); }} activeView={activeView} setActiveView={(v) => { setActiveView(v); setSubView('home'); }} onAddBalance={() => setSubView('add-money')}>
      {activeView === 'admin' && user.role === 'admin' && <AdminDashboard offers={dataService.getOffers()} orders={dataService.getOrders()} onRefresh={refreshData} />}
      {activeView === 'transactions' && <Transactions orders={dataService.getUserOrders(user.id)} />}
      {activeView === 'profile' && <ProfileView user={user} onUpdate={refreshData} onLogout={() => { firebaseAuth.logout(); setUser(null); }} />}
      {activeView === 'notifications' && <NotificationsView />}
      {activeView === 'update' && <UpdateView config={appConfig} />}
      
      {activeView === 'offers' && (
        <div className="space-y-6">
          {subView === 'home' && (
            <div className="animate-in fade-in space-y-6 pb-6">
              <div className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-xl shadow-black/5 border border-gray-100">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-green-600/20">৳</div>
                   <div>
                      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">ব্যালেন্স</p>
                      <p className="text-gray-800 text-xl font-black Hind-Siliguri">৳{user.balance.toLocaleString()}</p>
                   </div>
                </div>
                <button onClick={() => setSubView('add-money')} className="bg-green-600 rounded-xl px-4 py-2.5 text-white text-[11px] font-bold shadow-lg active:scale-95 transition-all">অ্যাড মানি</button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                 {[
                   { id: 'drive', label: 'ড্রাইভ অফার', icon: 'M13 10V3L4 14h7v7l9-11h-7z', cat: 'ড্রাইভ', color: 'text-orange-500' },
                   { id: 'minute', label: 'মিনিট প্যাক', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z', cat: 'মিনিট', color: 'text-blue-500' },
                   { id: 'recharge', label: 'রিচার্জ', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', color: 'text-green-600' },
                   { id: 'transfer', label: 'মানি ট্রান্সফার', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', color: 'text-rose-500' },
                   { id: 'refer', label: 'রেফার', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-indigo-600' },
                   { id: 'history', label: 'হিস্ট্রি', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-gray-600' },
                   { id: 'notice', label: 'নোটিশ', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', color: 'text-yellow-600' },
                   { id: 'profile', label: 'প্রোফাইল', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'text-purple-600' }
                 ].map((item, i) => (
                   <button 
                    key={i} 
                    onClick={() => {
                      if(item.id === 'recharge') setSubView('recharge');
                      else if(item.id === 'transfer') setSubView('transfer');
                      else if(item.id === 'refer') setSubView('referral');
                      else if(item.id === 'history') setActiveView('transactions');
                      else if(item.id === 'profile') setActiveView('profile');
                      else if(item.id === 'notice') setActiveView('notifications');
                      else if(item.cat) { setSelectedCategory(item.cat); setSubView('offer-list'); }
                      else alert('শীঘ্রই আসছে!');
                    }}
                    className="bg-white rounded-2xl py-4 flex flex-col items-center gap-2 border border-gray-100 shadow-xl shadow-black/5 active:scale-95 transition-all hover:bg-gray-50/50"
                   >
                     <div className={`${item.color}`}>
                       <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d={item.icon} /></svg>
                     </div>
                     <span className="text-[9px] font-black text-gray-800 Hind-Siliguri text-center">{item.label}</span>
                   </button>
                 ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[2.5rem] p-6 border border-blue-100 shadow-xl shadow-blue-600/5 flex flex-col items-center text-center space-y-4">
                 <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg">
                    <svg className="w-10 h-10 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.96-.75 3.78-1.65 6.31-2.74 7.58-3.27 3.61-1.51 4.36-1.77 4.85-1.78.11 0 .35.03.51.16.13.11.17.26.19.37.01.07.02.21.01.28z"/>
                    </svg>
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-gray-800 Hind-Siliguri leading-tight">জয়েন করুন আমাদের অফিশিয়াল টেলিগ্রাম চ্যানেলে!</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-wider">সব আপডেট সবার আগে পেতে</p>
                 </div>
                 <a href={appConfig.telegramUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3.5 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 active:scale-95 transition-all">জয়েন নাও</a>
              </div>
            </div>
          )}

          {subView === 'add-money' && <AddMoneyView onComplete={() => { refreshData(); setSubView('home'); }} />}

          {subView === 'recharge' && (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6 animate-in slide-in-from-right">
               <h3 className="text-lg font-bold text-gray-800 Hind-Siliguri">মোবাইল রিচার্জ</h3>
               <div className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">মোবাইল নম্বর</label>
                    <input id="rec_phone" placeholder="০১৭XXXXXXXX" className="w-full bg-gray-50 p-4 rounded-xl font-bold border border-gray-100 outline-none focus:border-green-600" type="tel" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">অপারেটর সিলেক্ট করুন</label>
                    <select id="rec_operator" className="w-full bg-gray-50 p-4 rounded-xl font-bold border border-gray-100 outline-none">
                      {OPERATORS.map(o => <option key={o.name} value={o.name}>{o.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">টাকার পরিমাণ</label>
                    <input id="rec_amount" placeholder="৳" className="w-full bg-gray-50 p-4 rounded-xl font-bold border border-gray-100 outline-none focus:border-green-600" type="number" />
                  </div>
                  <button onClick={() => {
                    const phone = (document.getElementById('rec_phone') as HTMLInputElement).value;
                    const amount = (document.getElementById('rec_amount') as HTMLInputElement).value;
                    const operator = (document.getElementById('rec_operator') as HTMLSelectElement).value;
                    if(!phone || !amount) return alert('সব তথ্য দিন');
                    if(user.balance < Number(amount)) return alert('ব্যালেন্স পর্যাপ্ত নয়');
                    dataService.createRecharge({userId: user.id, userName: user.name, phone, amount: Number(amount), operator});
                    alert('রিচার্জ রিকোয়েস্ট পাঠানো হয়েছে!');
                    setSubView('home');
                    refreshData();
                  }} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold uppercase tracking-widest mt-4 shadow-lg active:scale-95 transition-all">রিচার্জ কনফার্ম করুন</button>
               </div>
               <button onClick={() => setSubView('home')} className="w-full text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">পিছনে যান</button>
            </div>
          )}

          {subView === 'transfer' && (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6 animate-in slide-in-from-right">
               <h3 className="text-lg font-bold text-gray-800 Hind-Siliguri">মানি ট্রান্সফার</h3>
               <div className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">মেথড সিলেক্ট করুন</label>
                    <select id="tr_method" className="w-full bg-gray-50 p-4 rounded-xl font-bold border border-gray-100 outline-none">
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Rocket">Rocket</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">রিসিভার নম্বর</label>
                    <input id="tr_phone" placeholder="০১৭XXXXXXXX" className="w-full bg-gray-50 p-4 rounded-xl font-bold border border-gray-100 outline-none focus:border-rose-500" type="tel" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">টাকার পরিমাণ</label>
                    <input id="tr_amount" placeholder="৳" className="w-full bg-gray-50 p-4 rounded-xl font-bold border border-gray-100 outline-none focus:border-rose-500" type="number" />
                  </div>
                  <button onClick={() => {
                    const phone = (document.getElementById('tr_phone') as HTMLInputElement).value;
                    const amount = (document.getElementById('tr_amount') as HTMLInputElement).value;
                    const method = (document.getElementById('tr_method') as HTMLSelectElement).value;
                    if(!phone || !amount) return alert('সব তথ্য দিন');
                    if(user.balance < Number(amount)) return alert('ব্যালেন্স পর্যাপ্ত নয়');
                    dataService.createMoneyTransfer({userId: user.id, userName: user.name, phone, amount: Number(amount), method});
                    alert('ট্রান্সফার রিকোয়েস্ট পাঠানো হয়েছে!');
                    setSubView('home');
                    refreshData();
                  }} className="w-full py-4 bg-rose-500 text-white rounded-xl font-bold uppercase tracking-widest mt-4 shadow-lg active:scale-95 transition-all">ট্রান্সফার কনফার্ম করুন</button>
               </div>
               <button onClick={() => setSubView('home')} className="w-full text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">পিছনে যান</button>
            </div>
          )}

          {subView === 'referral' && (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 text-center space-y-6 animate-in slide-in-from-right">
               <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" /></svg></div>
               <h3 className="text-lg font-bold text-gray-800 Hind-Siliguri">রেফার করে আয় করুন</h3>
               <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-indigo-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">আপনার রেফার কোড</p>
                  <p className="text-2xl font-black text-indigo-600 mt-1">{user.referralCode}</p>
               </div>
               <div className="text-left bg-orange-50 p-4 rounded-xl border border-orange-100 space-y-2">
                  <p className="text-[11px] font-bold text-orange-700 Hind-Siliguri">১. একজনকে রেফার করলে পাবেন ৫ টাকা বোনাস।</p>
                  <p className="text-[11px] font-bold text-orange-700 Hind-Siliguri">২. শর্ত: নতুন ইউজার একাউন্ট খুলে যখন প্রথমবার ব্যালেন্স ডিপোজিট করবে, তখনই আপনি বোনাস পাবেন।</p>
               </div>
               <button onClick={() => {
                 navigator.clipboard.writeText(user.referralCode);
                 alert('রেফার কোড কপি হয়েছে!');
               }} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all">কোড কপি করুন</button>
               <button onClick={() => setSubView('home')} className="w-full text-xs text-gray-400 font-bold mt-2">পিছনে যান</button>
            </div>
          )}
          
          {subView === 'offer-list' && (
             <div className="space-y-4 animate-in slide-in-from-right">
                <div className="flex items-center gap-3">
                   <button onClick={() => setSubView('home')} className="p-2 bg-gray-100 rounded-lg text-gray-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg></button>
                   <h3 className="text-base font-bold text-gray-800 Hind-Siliguri">{selectedCategory} অফার</h3>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  <button onClick={() => setSelectedOperator('All')} className={`shrink-0 px-4 py-1.5 rounded-full text-[11px] font-bold ${selectedOperator === 'All' ? 'bg-green-600 text-white shadow-md shadow-green-600/20' : 'bg-gray-100 text-gray-400'}`}>সব</button>
                  {OPERATORS.map(op => (
                    <button key={op.name} onClick={() => setSelectedOperator(op.name)} className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold ${selectedOperator === op.name ? 'border-2 border-green-600 bg-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}><img src={op.logo} className="w-4 h-4 object-contain" />{op.name}</button>
                  ))}
                </div>

                <div className="space-y-3">
                  {filteredOffers.length > 0 ? filteredOffers.map(offer => (
                     <div key={offer.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-xl shadow-black/5">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-gray-50 rounded-xl p-2"><img src={OPERATORS.find(o => o.name === offer.operator)?.logo} className="w-full h-full object-contain" /></div>
                           <div><p className="font-bold text-sm text-gray-800 Hind-Siliguri">{offer.title}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{offer.duration}</p></div>
                        </div>
                        <div className="text-right pl-2"><p className="text-lg font-black text-green-600">৳{offer.price}</p><button onClick={() => setPurchasingOffer(offer)} className="mt-1.5 px-5 py-2 bg-green-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all">কিনুন</button></div>
                     </div>
                  )) : <div className="py-20 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest">বর্তমানে কোনো অফার নেই</div>}
                </div>
             </div>
          )}
        </div>
      )}
      {purchasingOffer && <OfferModal offer={purchasingOffer} onClose={() => setPurchasingOffer(null)} onConfirm={(phone) => {
        const newOrder: Order = { id: `ORD-${Date.now()}`, offerId: purchasingOffer.id, offerTitle: purchasingOffer.title, operator: purchasingOffer.operator, phoneNumber: phone, price: purchasingOffer.price, status: 'Pending', timestamp: Date.now(), userId: user.id, userName: user.name };
        dataService.createOrder(newOrder);
        dataService.updateUserBalanceById(user.id, -purchasingOffer.price);
        setPurchasingOffer(null);
        setActiveView('transactions');
      }} balance={user.balance} />}
    </Layout>
  );
};

export default App;
