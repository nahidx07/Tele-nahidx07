
import React, { useState } from 'react';
import { dataService } from '../services/dataService';
import { DepositRequest } from '../types';

interface AddMoneyViewProps {
  onComplete: () => void;
}

const AddMoneyView: React.FC<AddMoneyViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [trxId, setTrxId] = useState('');
  const [method, setMethod] = useState('');
  
  const paymentMethods = dataService.getPaymentMethods();
  const user = dataService.getUser();

  const handleRequest = () => {
    if (!amount || !trxId || !method) return;
    const req: DepositRequest = {
      id: `dep_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      method: method,
      amount: Number(amount),
      trxId: trxId,
      status: 'Pending',
      timestamp: Date.now()
    };
    dataService.createDeposit(req);
    alert('ডিপোজিট রিকোয়েস্ট পাঠানো হয়েছে। অ্যাডমিন চেক করে ব্যালেন্স যোগ করে দেবেন।');
    onComplete();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('নম্বর কপি করা হয়েছে: ' + text);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center mx-auto text-green-600 mb-4 shadow-sm border border-green-100">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           </div>
           <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest">অ্যাড মানি</h2>
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">আপনার একাউন্টে ব্যালেন্স যোগ করুন</p>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">নিচের নম্বরে টাকা পাঠিয়ে রিকোয়েস্ট করুন</p>
            </div>
            
            <div className="space-y-3">
               {paymentMethods.length > 0 ? paymentMethods.map(pm => (
                 <div key={pm.id} className="p-5 bg-white rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm hover:border-green-100 transition-all group">
                    <div className="flex-1">
                       <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{pm.provider} ({pm.type})</p>
                       <div className="flex items-center gap-3 mt-1">
                         <p className="text-lg font-black text-gray-800 tracking-tight">{pm.number}</p>
                         <button 
                           onClick={() => copyToClipboard(pm.number)}
                           className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 border border-gray-100 active:scale-90 transition-all shadow-sm"
                           title="কপি করুন"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                           </svg>
                         </button>
                       </div>
                    </div>
                    <button onClick={() => { setMethod(`${pm.provider} - ${pm.number}`); setStep(2); }} className="px-6 py-3 bg-gray-800 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all">সিলেক্ট</button>
                 </div>
               )) : (
                 <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">কোনো পেমেন্ট নম্বর সেট করা নেই</p>
                 </div>
               )}
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in zoom-in duration-300">
             <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 text-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-125 transition-transform"><svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg></div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">নির্বাচিত মেথড ও নম্বর</p>
               <p className="text-base font-black text-blue-700">{method}</p>
             </div>
             
             <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">টাকার পরিমাণ</label>
                   <input 
                    type="number" 
                    placeholder="যেমন: ৫০০" 
                    className="w-full bg-gray-50 p-5 rounded-2xl text-sm font-bold outline-none border border-gray-100 focus:border-green-500 transition-colors" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                   />
                </div>
                
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ট্রানজেকশন আইডি (TrxID)</label>
                   <input 
                    placeholder="যেমন: ABC123XYZ" 
                    className="w-full bg-gray-50 p-5 rounded-2xl text-sm font-bold outline-none border border-gray-100 uppercase focus:border-green-500 transition-colors" 
                    value={trxId} 
                    onChange={e => setTrxId(e.target.value)} 
                   />
                </div>
             </div>

             <div className="pt-4 space-y-4">
                <button onClick={handleRequest} className="w-full py-5 bg-green-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-green-600/20 active:scale-95 transition-all">সাবমিট রিকোয়েস্ট</button>
                <button onClick={() => setStep(1)} className="w-full py-3 text-[10px] font-black uppercase text-gray-400 tracking-widest hover:text-gray-600 transition-colors">পিছনে যান</button>
             </div>
          </div>
        )}
      </div>
      
      <div className="bg-orange-50 p-5 rounded-3xl border border-orange-100">
         <div className="flex gap-4">
            <span className="text-xl">💡</span>
            <p className="text-[10px] font-bold text-orange-700 leading-relaxed uppercase tracking-tight">সতর্কতা: টাকা পাঠানোর পর অবশ্যই ট্রানজেকশন আইডি (TrxID) সঠিক ভাবে প্রদান করবেন। ভুল আইডি দিলে রিকোয়েস্ট বাতিল হতে পারে।</p>
         </div>
      </div>
    </div>
  );
};

export default AddMoneyView;
