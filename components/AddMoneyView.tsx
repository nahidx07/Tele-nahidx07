
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
  const [senderPhone, setSenderPhone] = useState('');
  const [method, setMethod] = useState('');
  
  const paymentMethods = dataService.getPaymentMethods();
  const user = dataService.getUser();

  const handleRequest = () => {
    if (!amount || !trxId || !method || !senderPhone) return alert('সবগুলো তথ্য পূরণ করুন');
    const req: DepositRequest = {
      id: `dep_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      method: `${method} (${senderPhone})`,
      amount: Number(amount),
      trxId: trxId,
      status: 'Pending',
      timestamp: Date.now()
    };
    dataService.createDeposit(req);
    alert('ডিপোজিট রিকোয়েস্ট পাঠানো হয়েছে!');
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
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" /></svg>
           </div>
           <h2 className="text-xl font-black text-gray-800 Hind-Siliguri">ব্যালেন্স অ্যাড</h2>
           <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">আপনার পেমেন্ট রিকোয়েস্ট সাবমিট করুন</p>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 text-center">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">নিচের নম্বর কপি করে টাকা পাঠিয়ে দিন</p>
            </div>
            <div className="space-y-3">
               {paymentMethods.map(pm => (
                 <div key={pm.id} className="p-5 bg-white rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm">
                    <div>
                       <p className="text-[9px] font-black text-blue-600 uppercase">{pm.provider} ({pm.type})</p>
                       <div className="flex items-center gap-3 mt-1">
                         <p className="text-lg font-black text-gray-800">{pm.number}</p>
                         <button onClick={() => copyToClipboard(pm.number)} className="p-2 bg-gray-50 rounded-xl text-gray-400 border border-gray-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg></button>
                       </div>
                    </div>
                    <button onClick={() => { setMethod(pm.provider); setStep(2); }} className="px-6 py-3 bg-gray-800 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg">সিলেক্ট</button>
                 </div>
               ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in zoom-in">
             <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 text-center">
               <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">পেমেন্ট মেথড</p>
               <p className="text-base font-black text-blue-700">{method}</p>
             </div>
             
             <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase ml-1">আপনার নম্বর (যেটা থেকে টাকা পাঠিয়েছেন)</label>
                   <input type="tel" placeholder="যেমন: ০১৭XXXXXXXX" className="w-full bg-gray-50 p-5 rounded-2xl text-sm font-bold border border-gray-100" value={senderPhone} onChange={e => setSenderPhone(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase ml-1">টাকার পরিমাণ</label>
                   <input type="number" placeholder="যেমন: ৫০০" className="w-full bg-gray-50 p-5 rounded-2xl text-sm font-bold border border-gray-100" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase ml-1">ট্রানজেকশন আইডি (TrxID)</label>
                   <input placeholder="যেমন: ABC123XYZ" className="w-full bg-gray-50 p-5 rounded-2xl text-sm font-bold border border-gray-100 uppercase" value={trxId} onChange={e => setTrxId(e.target.value)} />
                </div>
             </div>

             <div className="pt-4 space-y-4">
                <button onClick={handleRequest} className="w-full py-5 bg-green-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-green-600/20 active:scale-95 transition-all">সাবমিট করুন</button>
                <button onClick={() => setStep(1)} className="w-full py-3 text-[10px] font-black text-gray-400 uppercase">পিছনে যান</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddMoneyView;
