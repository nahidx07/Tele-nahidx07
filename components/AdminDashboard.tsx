
import React, { useState, useMemo } from 'react';
import { Offer, Order, User, DepositRequest, TransferRequest, PaymentMethod, AppConfig, Notification } from '../types';
import { OPERATORS, CATEGORIES } from '../constants';
import { dataService } from '../services/dataService';
import { GoogleGenAI, Type } from "@google/genai";

interface AdminDashboardProps {
  offers: Offer[];
  orders: Order[];
  onRefresh: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ offers, orders, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'deposits' | 'transfers' | 'users' | 'offers' | 'settings' | 'broadcast'>('dashboard');
  
  // Modal & UI States
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');

  // Form States
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({ operator: 'GP', category: 'ড্রাইভ', isActive: true, price: 0, originalPrice: 0, title: '', duration: '৩০ দিন' });
  const [config, setConfig] = useState<AppConfig>(dataService.getConfig());
  const [newPM, setNewPM] = useState<Partial<PaymentMethod>>({ provider: 'Bkash', type: 'Personal', number: '' });
  const [newUser, setNewUser] = useState<Partial<User>>({ name: '', phone: '', balance: 0, role: 'user' });
  const [broadcast, setBroadcast] = useState({ title: '', message: '' });

  const allDeposits = dataService.getDeposits();
  const transfers = dataService.getTransfers();
  const users = dataService.getUsers();
  const paymentMethods = dataService.getPaymentMethods();

  const handleBroadcast = () => {
    if (!broadcast.title || !broadcast.message) return alert('টাইটেল ও মেসেজ দিন');
    const n: Notification = {
      id: `bc_${Date.now()}`,
      title: broadcast.title,
      message: broadcast.message,
      timestamp: Date.now(),
      type: 'broadcast',
      isRead: false
    };
    dataService.saveNotification(n);
    alert('সফলভাবে ব্রডকাস্ট করা হয়েছে!');
    setBroadcast({ title: '', message: '' });
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.phone) return alert('নাম ও ফোন দিন');
    const u: User = {
      id: `u_${Date.now()}`,
      name: newUser.name,
      phone: newUser.phone,
      balance: Number(newUser.balance) || 0,
      role: newUser.role as any || 'user'
    };
    dataService.updateUser(u);
    alert('ইউজার ক্রিয়েট হয়েছে!');
    setNewUser({ name: '', phone: '', balance: 0, role: 'user' });
    onRefresh();
  };

  const handleAiBulkUpload = async () => {
    if (!aiInput.trim()) return alert('পেস্ট করুন');
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract telecom offers from: "${aiInput}" into JSON array with fields: operator, title, price, originalPrice, duration, category.`,
        config: { responseMimeType: "application/json" }
      });
      const parsedOffers = JSON.parse(response.text || '[]');
      parsedOffers.forEach((off: any) => dataService.saveOffer({ ...off, id: `off_${Math.random()}`, isActive: true }));
      alert('সফল হয়েছে!');
      setAiInput('');
      onRefresh();
    } catch (e) { console.error(e); } finally { setIsAiLoading(false); }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['dashboard', 'orders', 'deposits', 'users', 'offers', 'broadcast', 'settings'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}
          >
            {tab === 'dashboard' ? 'হোম' : tab === 'orders' ? 'অর্ডার' : tab === 'deposits' ? 'অ্যাড মানি' : tab === 'users' ? 'ইউজার' : tab === 'offers' ? 'অফার' : tab === 'broadcast' ? 'ব্রডকাস্ট' : 'সেটিংস'}
          </button>
        ))}
      </div>

      {activeTab === 'broadcast' && (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
           <h3 className="text-sm font-black text-gray-800 uppercase">সকল ইউজারকে মেসেজ পাঠান</h3>
           <input placeholder="টাইটেল" className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold border border-gray-100 outline-none" value={broadcast.title} onChange={e => setBroadcast({...broadcast, title: e.target.value})} />
           <textarea placeholder="মেসেজ লিখুন..." className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold border border-gray-100 outline-none min-h-[100px]" value={broadcast.message} onChange={e => setBroadcast({...broadcast, message: e.target.value})} />
           <button onClick={handleBroadcast} className="w-full py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase shadow-lg">মেসেজ পাঠান</button>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-gray-800 uppercase">ম্যানুয়াল ইউজার ক্রিয়েট</h3>
              <input placeholder="নাম" className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold border border-gray-100" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              <input placeholder="ফোন" className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold border border-gray-100" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
              <input placeholder="ব্যালেন্স" type="number" className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold border border-gray-100" value={newUser.balance} onChange={e => setNewUser({...newUser, balance: Number(e.target.value)})} />
              <button onClick={handleCreateUser} className="w-full py-4 bg-green-600 text-white rounded-2xl text-xs font-black uppercase">ইউজার যোগ করুন</button>
           </div>
           <div className="space-y-3">
              {users.map(u => (
                <div key={u.id} className="bg-white p-4 rounded-2xl border border-gray-50 flex justify-between items-center">
                   <div><p className="font-bold text-sm">{u.name}</p><p className="text-[10px] text-gray-400">{u.phone}</p></div>
                   <p className="font-black text-green-600">৳{u.balance}</p>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-blue-600 uppercase">টেলিগ্রাম বট নোটিফিকেশন</h3>
            <p className="text-[9px] font-bold text-gray-400 uppercase">নতুন অর্ডার এলে আপনার টেলিগ্রাম বক-এ সাথে সাথে মেসেজ যাবে।</p>
            <input placeholder="Bot Token" className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold border border-gray-100 outline-none" value={config.tgBotToken} onChange={e => setConfig({...config, tgBotToken: e.target.value})} />
            <input placeholder="Admin Chat ID" className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold border border-gray-100 outline-none" value={config.tgAdminChatId} onChange={e => setConfig({...config, tgAdminChatId: e.target.value})} />
            <button onClick={() => { dataService.saveConfig(config); alert('সেভ হয়েছে'); }} className="w-full py-4 bg-gray-800 text-white rounded-2xl text-xs font-black uppercase">বট সেটিংস সেভ করুন</button>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-800 uppercase">পেমেন্ট মেথড</h3>
            <input placeholder="নম্বর" className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-bold border border-gray-100" value={newPM.number} onChange={e => setNewPM({...newPM, number: e.target.value})} />
            <button onClick={() => { if(newPM.number) { dataService.savePaymentMethod({id: `${Date.now()}`, provider: 'Bkash', number: newPM.number!, type: 'Personal'}); onRefresh(); } }} className="w-full py-4 bg-green-600 text-white rounded-2xl text-xs font-black uppercase">বিকাশ নম্বর যোগ করুন</button>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase">মোট ইউজার</p><p className="text-3xl font-black mt-2">{users.length}</p></div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase">মোট অফার</p><p className="text-3xl font-black mt-2">{offers.length}</p></div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
