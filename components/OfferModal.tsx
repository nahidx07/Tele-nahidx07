
import React, { useState } from 'react';
import { Offer } from '../types';

interface OfferModalProps {
  offer: Offer;
  onClose: () => void;
  onConfirm: (phone: string) => void;
  balance: number;
}

const OfferModal: React.FC<OfferModalProps> = ({ offer, onClose, onConfirm, balance }) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^(01)[3-9][0-9]{8}$/.test(phone)) {
      setError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');
      return;
    }
    if (balance < offer.price) {
      setError('আপনার ব্যালেন্স পর্যাপ্ত নয়');
      return;
    }
    onConfirm(phone);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 z-[100] animate-in fade-in duration-300">
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500">
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">অফার ক্রয়</h3>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">{offer.title}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">গ্রাহকের মোবাইল নম্বর</label>
            <input 
              type="tel" 
              placeholder="01XXXXXXXXX"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:border-green-600 focus:ring-4 focus:ring-green-600/5 outline-none transition-all text-xl font-bold text-center text-gray-800 placeholder:text-gray-300"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError('');
              }}
              autoFocus
            />
            {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-tighter">{error}</p>}
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 space-y-3 border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase">মূল্য</span>
              <span className="text-lg font-bold text-green-600">৳{offer.price}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200/50">
              <span className="text-xs font-bold text-gray-400 uppercase">ব্যালেন্স</span>
              <span className="text-sm font-bold text-gray-600">৳{balance}</span>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-green-600 text-white rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-green-600/20 active:scale-95 transition-all"
          >
            অর্ডার নিশ্চিত করুন
          </button>
        </form>
      </div>
    </div>
  );
};

export default OfferModal;
