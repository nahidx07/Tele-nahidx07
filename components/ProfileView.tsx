
import React, { useState } from 'react';
import { User } from '../types';
import { dataService } from '../services/dataService';

interface ProfileViewProps {
  user: User;
  onUpdate: () => void;
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);

  const handleSave = () => {
    if (!name.trim()) return;
    const updatedUser = { ...user, name, phone };
    dataService.updateUser(updatedUser);
    localStorage.setItem('telecom_bangla_user', JSON.stringify(updatedUser));
    setIsEditing(false);
    onUpdate();
    alert('প্রোফাইল আপডেট হয়েছে!');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="text-center space-y-4 pt-4">
        <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto border-4 border-white shadow-xl relative">
          <span className="text-4xl">👤</span>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-600 rounded-2xl border-4 border-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">{user.name}</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{user.role} Account</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 space-y-6">
        {isEditing ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">আপনার নাম</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-800 outline-none focus:border-green-600 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ফোন নম্বর</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold text-gray-800 outline-none focus:border-green-600 transition-colors"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest"
              >
                বাতিল
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-green-600/20"
              >
                সেভ করুন
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-[1.8rem] border border-gray-100">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">পুরো নাম</p>
                <p className="font-bold text-gray-800">{user.name}</p>
              </div>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-300 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-[1.8rem] border border-gray-100">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">ফোন নম্বর</p>
                <p className="font-bold text-gray-800">{user.phone}</p>
              </div>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-300 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5.172V18a2 2 0 002 2h14a2 2 0 002-2V5.172a2 2 0 00-.586-1.414l-4.414-4.414A2 2 0 0010.586 0H5a2 2 0 00-2 2v3.172z" /></svg>
              </div>
            </div>

            <button 
              onClick={() => setIsEditing(true)}
              className="w-full py-4 border-2 border-dashed border-gray-200 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-green-200 hover:text-green-600 transition-all active:scale-95"
            >
              প্রোফাইল এডিট করুন
            </button>
          </div>
        )}
      </div>

      <div className="pt-4">
        <button 
          onClick={onLogout}
          className="w-full py-5 bg-white text-red-600 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm border border-red-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          লগআউট করুন
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
