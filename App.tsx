
import React, { useState, useEffect, useMemo } from 'react';
import { Offer, Order, User, Operator, DepositRequest, TransferRequest, AppConfig } from './types';
import { dataService } from './services/dataService';
import Layout from './components/Layout';
import OfferModal from './components/OfferModal';
import AdminDashboard from './components/AdminDashboard';
import Transactions from './components/Transactions';
import AddMoneyView from './components/AddMoneyView';
import ProfileView from './components/ProfileView';
import NotificationsView from './components/NotificationsView';
import { OPERATORS, STORAGE_KEYS } from './constants';

type SubView = 'home' | 'operator-select' | 'offer-list' | 'recharge' | 'transfer' | 'add-money';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeView, setActiveView] = useState<'offers' | 'transactions' | 'admin' | 'update' | 'profile' | 'notifications'>('offers');
  const [subView, setSubView] = useState<SubView>('home');
  const [selectedOperator, setSelectedOperator] = useState<Operator | 'All' | null>(null);
  const [purchasingOffer, setPurchasingOffer] = useState<Offer | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig>(dataService.getConfig());
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authData, setAuthData] = useState({ name: '', phone: '', email: '', password: '' });

  const refreshData = () => {
    setOffers(dataService.getOffers());
    setOrders(dataService.getOrders());
    const currentUser = dataService.getUser();
    setUser(currentUser);
    setAppConfig(dataService.getConfig());
  };

  useEffect(() => {
    // Check Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      const tgUser = tg.initDataUnsafe.user;
      const users = dataService.getUsers();
      let existing = users.find(u => u.telegramId === tgUser.id.toString());
      
      if (!existing) {
        existing = {
          id: `u_tg_${tgUser.id}`,
          name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
          phone: '',
          balance: 0,
          role: 'user',
          telegramId: tgUser.id.toString(),
          avatarUrl: tgUser.photo_url || `https://ui-avatars.com/api/?name=${tgUser.first_name}`
        };
        dataService.updateUser(existing);
      }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(existing));
      setUser(existing);
      setIsAuthLoading(false);
      tg.expand();
    } else {
      refreshData();
      setIsAuthLoading(false);
    }
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const users = dataService.getUsers();
    
    if (authMode === 'register') {
      if (!authData.name || !authData.phone) return alert('সব তথ্য দিন');
      const newUser: User = {
        id: `u_${Date.now()}`,
        name: authData.name,
        phone: authData.phone,
        email: authData.email,
        balance: 0,
        role: 'user'
      };
      dataService.updateUser(newUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      setUser(newUser);
    } else {
      const found = users.find(u => u.phone === authData.phone || u.email === authData.email);
      if (found) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(found));
        setUser(found);
      } else {
        alert('ইউজার পাওয়া যায়নি। রেজিস্ট্রেশন করুন।');
      }
    }
  };

  const handleGoogleLogin = () => {
    // Simulated Google Login
    const demoUser: User = {
      id: `u_google_${Date.now()}`,
      name: 'Google User',
      phone: '',
      email: 'user@gmail.com',
      balance: 10,
      role: 'user',
      avatarUrl: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png'
    };
    dataService.updateUser(demoUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const filteredOffers = useMemo(() => {
    if (!selectedOperator) return [];
    if (selectedOperator === 'All') return offers.filter(o => o.isActive);
    return offers.filter(o => o.operator === selectedOperator && o.isActive);
  }, [offers, selectedOperator]);

  const handlePurchase = (phone: string) => {
    if (!purchasingOffer || !user) return;
    if (user.isBanned) return alert('ব্যান করা হয়েছে।');
    
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      offerId: purchasingOffer.id,
      offerTitle: purchasingOffer.title,
      operator: purchasingOffer.operator,
      phoneNumber: phone,
      price: purchasingOffer.price,
      duration: purchasingOffer.duration,
      status: 'Pending',
      timestamp: Date.now(),
      userId: user.id,
      userName: user.name
    };
    dataService.createOrder(newOrder);
    dataService.updateUserBalance(-purchasingOffer.price);
    setPurchasingOffer(null);
    refreshData();
    setActiveView('transactions');
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    window.location.reload();
  };

  if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in duration-700">
           <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-green-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-green-600/20 text-white text-3xl font-black">TB</div>
              <h1 className="text-2xl font-black text-gray-800">টেলিকম বাংলায় স্বাগতম</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{authMode === 'login' ? 'লগইন করুন' : 'নতুন একাউন্ট খুলুন'}</p>
           </div>

           <form onSubmit={handleAuth} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-4">
              {authMode === 'register' && (
                 <input placeholder="পুরো নাম" className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-bold border border-gray-100 outline-none focus:border-green-400" value={authData.name} onChange={e => setAuthData({...authData, name: e.target.value})} />
              )}
              <input placeholder="ফোন নম্বর" type="tel" className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-bold border border-gray-100 outline-none focus:border-green-400" value={authData.phone} onChange={e => setAuthData({...authData, phone: e.target.value})} />
              <input placeholder="পাসওয়ার্ড (ঐচ্ছিক)" type="password" className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-bold border border-gray-100 outline-none focus:border-green-400" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} />
              <button className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">
                {authMode === 'login' ? 'লগইন' : 'রেজিস্ট্রেশন'}
              </button>
           </form>

           <div className="space-y-4 text-center">
              <div className="flex items-center gap-4 text-gray-300">
                <div className="flex-1 h-px bg-gray-200"></div><span className="text-[10px] font-black uppercase">অথবা</span><div className="flex-1 h-px bg-gray-200"></div>
              </div>
              <button onClick={handleGoogleLogin} className="w-full py-4 bg-white border border-gray-200 rounded-2xl flex items-center justify-center gap-3 font-bold text-gray-600 text-xs shadow-sm active:scale-95">
                <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-5 h-5" />
                গুগল দিয়ে লগইন
              </button>
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
                {authMode === 'login' ? 'নতুন একাউন্ট খুলতে ক্লিক করুন' : 'আগের একাউন্ট থাকলে লগইন করুন'}
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout}
      activeView={activeView}
      setActiveView={(v) => { setActiveView(v); setSubView('home'); }}
      onAddBalance={() => setSubView('add-money')}
    >
      {activeView === 'admin' && user.role === 'admin' && (
        <AdminDashboard offers={offers} orders={orders} onRefresh={refreshData} />
      )}

      {activeView === 'transactions' && <Transactions orders={dataService.getUserOrders(user.id)} />}
      {activeView === 'profile' && <ProfileView user={user} onUpdate={refreshData} onLogout={handleLogout} />}
      {activeView === 'notifications' && <NotificationsView />}

      {activeView === 'offers' && (
        <div className="space-y-6 pb-10">
          {subView === 'home' && (
            <>
              <div className="bg-white rounded-[2.5rem] p-8 flex items-center justify-between border border-gray-100 shadow-sm">
                <div>
                   <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">একাউন্ট ব্যালেন্স</h3>
                   <p className="text-3xl font-black text-gray-800">৳{user.balance.toLocaleString()}</p>
                </div>
                <button onClick={() => setSubView('add-money')} className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-600/20 active:scale-90"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg></button>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-6">
                 {[
                   { label: 'ড্রাইভ অফার', color: 'bg-orange-50 text-orange-500', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                   { label: 'মাই অফার', color: 'bg-blue-50 text-blue-500', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
                   { label: 'রিচার্জ', color: 'bg-pink-50 text-pink-500', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
                   { label: 'অ্যাড মানি', color: 'bg-green-50 text-green-600', icon: 'M12 8v8m-4-4h8' },
                   { label: 'মানি ট্রান্সফার', color: 'bg-purple-50 text-purple-600', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
                   { label: 'সেটিংস', color: 'bg-gray-50 text-gray-500', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
                 ].map((item, i) => (
                   <button key={i} onClick={() => { 
                      if (item.label === 'ড্রাইভ অফার') setSubView('operator-select');
                      else if (item.label === 'অ্যাড মানি') setSubView('add-money');
                   }} className="bg-white rounded-[1.5rem] py-5 px-2 flex flex-col items-center gap-2.5 border border-gray-100 shadow-sm active:scale-95 transition-all">
                     <div className={`w-10 h-10 ${item.color} rounded-2xl flex items-center justify-center`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} /></svg>
                     </div>
                     <span className="text-[10px] font-bold text-gray-700 uppercase">{item.label}</span>
                   </button>
                 ))}
              </div>
            </>
          )}

          {subView === 'add-money' && <AddMoneyView onComplete={() => { refreshData(); setSubView('home'); }} />}
          {subView === 'operator-select' && (
             <div className="grid grid-cols-3 gap-3">
                <button onClick={() => { setSelectedOperator('All'); setSubView('offer-list'); }} className="bg-white py-4 rounded-2xl border border-gray-100"><span className="text-[10px] font-black uppercase text-green-600">সব অফার</span></button>
                {OPERATORS.map(op => (
                   <button key={op.name} onClick={() => { setSelectedOperator(op.name); setSubView('offer-list'); }} className="bg-white py-4 rounded-2xl border border-gray-100"><span className="text-[10px] font-black uppercase">{op.name}</span></button>
                ))}
             </div>
          )}
          {subView === 'offer-list' && (
             <div className="space-y-4">
                {filteredOffers.map(offer => (
                   <div key={offer.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 flex justify-between items-center shadow-sm">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center p-3"><img src={OPERATORS.find(o => o.name === offer.operator)?.logo} className="w-full h-full object-contain" /></div>
                         <div><p className="font-bold text-sm">{offer.title}</p><p className="text-[10px] font-black text-gray-400 uppercase">{offer.duration}</p></div>
                      </div>
                      <div className="text-right">
                         <p className="text-lg font-black text-green-600">৳{offer.price}</p>
                         <button onClick={() => setPurchasingOffer(offer)} className="mt-2 px-6 py-2 bg-green-600 text-white rounded-full text-[10px] font-black uppercase shadow-lg">কিনুন</button>
                      </div>
                   </div>
                ))}
             </div>
          )}
        </div>
      )}
      {purchasingOffer && <OfferModal offer={purchasingOffer} onClose={() => setPurchasingOffer(null)} onConfirm={handlePurchase} balance={user.balance} />}
    </Layout>
  );
};

export default App;
