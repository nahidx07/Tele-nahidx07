
import React, { useEffect } from 'react';
import { dataService } from '../services/dataService';

const NotificationsView: React.FC = () => {
  const notifications = dataService.getNotifications();

  useEffect(() => {
    dataService.markAllAsRead();
  }, []);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black text-gray-800 tracking-tight">নোটিফিকেশন</h2>
        <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">{notifications.length}টি পাওয়া গেছে</span>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div key={n.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${n.type === 'broadcast' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-gray-800 text-sm">{n.title}</h4>
              <span className="text-[9px] font-bold text-gray-400">{new Date(n.timestamp).toLocaleDateString('bn-BD')}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              {n.message}
            </p>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="py-20 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">বর্তমানে কোনো নোটিফিকেশন নেই</div>
      )}
    </div>
  );
};

export default NotificationsView;
