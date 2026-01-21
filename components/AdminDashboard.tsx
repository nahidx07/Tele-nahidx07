
import React, { useState } from 'react';
import { Offer, Order, User, DepositRequest, AppConfig, PaymentMethod, Operator } from '../types';
import { dataService } from '../services/dataService';
import { OPERATORS } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";

interface AdminDashboardProps {
  offers: Offer[];
  orders: Order[];
  onRefresh: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ offers, orders, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'deposits' | 'users' | 'settings' | 'ai-upload'>('stats');
  const [config, setConfig] = useState<AppConfig>(dataService.getConfig());
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const users = dataService.getUsers();
  const deposits = dataService.getDeposits();
  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;

  const handleAiUpload = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Extract telecom offers from the following text and return them as a JSON array: "${aiInput}"`,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                operator: { type: Type.STRING, description: 'One of: GP, Robi, Banglalink, Airtel, Teletalk' },
                title: { type: Type.STRING },
                price: { type: Type.NUMBER },
                duration: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING, description: 'One of: ড্রাইভ, মিনিট, বান্ডেল' }
              },
              required: ['operator', 'title', 'price', 'duration'],
            }
          }
        }
      });
      const jsonStr = response.text?.trim() || '[]';
      const extractedOffers = JSON.parse(jsonStr);
      if (Array.isArray(extractedOffers)) {
        extractedOffers.forEach(o => {
          const newOffer: Offer = {
            id: `OFFER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            operator: o.operator as Operator,
            title: o.title,
            description: o.description || o.title,
            price: Number(o.price),
            originalPrice: Number(o.price) + 20,
            duration: o.duration,
            category: (o.category as any) || 'ড্রাইভ',
            isActive: true
          };
          dataService.saveOffer(newOffer);
        });
        alert(`${extractedOffers.length}টি অফার সফলভাবে যুক্ত হয়েছে!`);
        setAiInput('');
        onRefresh();
      }
    } catch (error) {
      alert('AI প্রসেসিং ব্যর্থ হয়েছে।');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
        {[
          { id: 'stats', label: 'ড্যাশবোর্ড', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
          { id: 'ai-upload', label: 'AI আপলোড', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
          { id: 'orders', label: 'অর্ডার', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
          { id: 'deposits', label: 'ডিপোজিট', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2' },
          { id: 'users', label: 'মেম্বার', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z' },
          { id: 'settings', label: 'সেটিংস', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`shrink-0 px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-green-600 text-white shadow-xl shadow-green-600/20' : 'bg-white text-gray-400 border border-gray-100'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} /></svg>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 gap-4 animate-in zoom-in px-1">
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 text-center">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">মোট মেম্বার</p>
             <p className="text-3xl font-black mt-2 text-gray-800">{users.length}</p>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 text-center">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">পেন্ডিং অর্ডার</p>
             <p className="text-3xl font-black mt-2 text-orange-500">{pendingOrders}</p>
          </div>
        </div>
      )}

      {activeTab === 'ai-upload' && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 space-y-6 px-1 mx-1 animate-in slide-in-from-bottom">
           <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">AI অফার আপলোড</h3>
           <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <p className="text-[11px] font-bold text-indigo-700 leading-relaxed Hind-Siliguri">
                <b>কিভাবে কাজ করবে:</b> আপনার অফার টেক্সটটি (যেমন: GP 10GB 30Days 299Tk) নিচের বক্সে পেস্ট করুন। AI এটি থেকে সঠিক অপারেটর, মেয়াদ ও দাম নিজে থেকেই বুঝে ডাটাবেসে সেভ করে দিবে।
              </p>
           </div>
           <textarea 
             className="w-full bg-gray-50 p-6 rounded-[2rem] text-sm font-medium border border-gray-100 min-h-[200px] outline-none shadow-inner"
             placeholder="আপনার অফার লিস্ট এখানে পেস্ট করুন..."
             value={aiInput}
             onChange={e => setAiInput(e.target.value)}
           />
           <button 
             onClick={handleAiUpload}
             disabled={isAiLoading}
             className={`w-full py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${isAiLoading ? 'bg-gray-400' : 'bg-indigo-600 text-white active:scale-95 shadow-lg shadow-indigo-600/20'}`}
           >
             {isAiLoading ? 'AI প্রসেসিং...' : 'AI দিয়ে আপলোড করুন'}
           </button>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 space-y-8 px-1 mx-1 animate-in slide-in-from-bottom">
           <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest text-blue-600">মেইন অ্যাপ সেটিংস</h3>
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-2">App Logo URL</label>
                 <input type="text" className="w-full bg-gray-50 p-5 rounded-2xl text-xs font-mono border border-gray-100 outline-none focus:border-blue-400" value={config.logoUrl} onChange={e => setConfig({...config, logoUrl: e.target.value})} placeholder="https://example.com/logo.png" />
                 <p className="text-[9px] text-gray-400 px-1">এখানে আপনার লোগোর সরাসরি লিংক দিন।</p>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Download Link</label>
                 <input type="text" className="w-full bg-gray-50 p-5 rounded-2xl text-xs font-mono border border-gray-100 outline-none focus:border-blue-400" value={config.downloadUrl} onChange={e => setConfig({...config, downloadUrl: e.target.value})} placeholder="https://drive.google.com/..." />
                 <p className="text-[9px] text-gray-400 px-1">অ্যাপ আপডেট করার জন্য ড্রাইভ বা ডিরেক্ট ডাউনলোড লিংক দিন।</p>
              </div>
              
              <div className="relative py-4">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                 <div className="relative flex justify-center text-[10px] uppercase font-black text-gray-300 bg-white px-2">বট সেটিংস</div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Bot Token</label>
                 <input type="password" className="w-full bg-gray-50 p-5 rounded-2xl text-xs font-mono border border-gray-100 outline-none focus:border-blue-400" value={config.botToken} onChange={e => setConfig({...config, botToken: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Admin Chat ID</label>
                 <input type="text" className="w-full bg-gray-50 p-5 rounded-2xl text-xs font-mono border border-gray-100 outline-none focus:border-blue-400" value={config.adminChatId} onChange={e => setConfig({...config, adminChatId: e.target.value})} />
              </div>
           </div>
           <button onClick={() => { dataService.saveConfig(config); alert('সফলভাবে সেভ হয়েছে!'); }} className="w-full py-5 bg-gray-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl">সব আপডেট সেভ করুন</button>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4 px-1">
           <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest ml-1">মেম্বার লিস্ট ({users.length})</h3>
           {users.map(u => (
             <div key={u.id} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400">
                      {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full rounded-full object-cover" /> : '👤'}
                   </div>
                   <div>
                      <p className="text-sm font-bold text-gray-800">{u.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{u.phone || u.email || 'No Contact'}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-black text-green-600">৳{u.balance}</p>
                   <p className="text-[8px] font-black text-gray-300 uppercase mt-0.5">Role: {u.role}</p>
                </div>
             </div>
           ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4 px-1">
           {orders.length > 0 ? orders.map(order => (
             <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-5">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center p-2"><img src={OPERATORS.find(o => o.name === order.operator)?.logo} className="w-full h-full object-contain" /></div>
                      <div>
                         <p className="text-sm font-bold text-gray-800 Hind-Siliguri">{order.offerTitle}</p>
                         <p className="text-[10px] text-gray-400 font-black uppercase mt-1.5">{order.userName} • {order.phoneNumber}</p>
                      </div>
                   </div>
                   <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full ${order.status === 'Success' ? 'bg-green-50 text-green-600' : order.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>{order.status}</span>
                </div>
                {order.status === 'Pending' && (
                  <div className="flex gap-3">
                     <button onClick={() => { dataService.updateOrderStatus(order.id, 'Success'); onRefresh(); }} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-[10px]">Approve</button>
                     <button onClick={() => { dataService.updateOrderStatus(order.id, 'Cancelled'); onRefresh(); }} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px]">Cancel</button>
                  </div>
                )}
             </div>
           )) : <div className="py-20 text-center text-gray-300 font-bold uppercase text-[10px]">কোনো অর্ডার নেই</div>}
        </div>
      )}

      {activeTab === 'deposits' && (
        <div className="space-y-4 px-1">
           {deposits.length > 0 ? deposits.map(dep => (
             <div key={dep.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-4">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-sm font-black text-gray-800">৳{dep.amount}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{dep.userName} • {dep.method}</p>
                      <p className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full inline-block mt-2 font-mono">{dep.trxId}</p>
                   </div>
                   <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full ${dep.status === 'Success' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>{dep.status}</span>
                </div>
                {dep.status === 'Pending' && (
                  <div className="flex gap-3">
                     <button onClick={() => { dataService.updateDepositStatus(dep.id, 'Success'); onRefresh(); }} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-[10px]">Approve</button>
                     <button onClick={() => { dataService.updateDepositStatus(dep.id, 'Cancelled'); onRefresh(); }} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px]">Reject</button>
                  </div>
                )}
             </div>
           )) : <div className="py-20 text-center text-gray-300 font-bold uppercase text-[10px]">কোনো রিকোয়েস্ট নেই</div>}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
