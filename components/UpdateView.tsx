
import React from 'react';
import { AppConfig } from '../types';

interface UpdateViewProps {
  config: AppConfig;
}

const UpdateView: React.FC<UpdateViewProps> = ({ config }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v8" /></svg>
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800 Hind-Siliguri">অ্যাপ আপডেট</h2>
        <p className="text-sm text-gray-400 mt-2 font-medium">বর্তমান ভার্সন: {config.version}</p>
      </div>
      <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 w-full max-w-xs">
         <p className="text-xs text-gray-600 Hind-Siliguri leading-relaxed">আপনার অ্যাপটি সর্বশেষ ভার্সনে আপডেট রাখতে নিচে বাটনে ক্লিক করুন।</p>
      </div>
      <a 
        href={config.downloadUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="px-10 py-4 bg-green-600 text-white rounded-2xl font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-green-600/20 active:scale-95 transition-all"
      >
        এখনই আপডেট করুন
      </a>
    </div>
  );
};

export default UpdateView;
