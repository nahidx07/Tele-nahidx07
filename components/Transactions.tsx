
import React from 'react';
import { Order } from '../types';

interface TransactionsProps {
  orders: Order[];
}

const Transactions: React.FC<TransactionsProps> = ({ orders }) => {
  return (
    <div className="space-y-5 pb-20">
      <h2 className="text-xl font-black text-gray-800 px-1 tracking-tight">লেনদেনের ইতিহাস</h2>
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="py-20 bg-white rounded-[2.5rem] border border-gray-100 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest shadow-sm">কোনো রেকর্ড পাওয়া যায়নি</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex justify-between items-center shadow-sm hover:border-blue-100 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-black text-lg">
                  ৳
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 leading-tight">{order.offerTitle}</h4>
                  <p className="text-[10px] text-gray-400 mt-1.5 font-bold uppercase">{order.phoneNumber} • {new Date(order.timestamp).toLocaleDateString('bn-BD')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-black text-gray-800 tracking-tight">৳{order.price}</p>
                <span className={`inline-block mt-2 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  order.status === 'Success' ? 'bg-green-100 text-green-700' : 
                  order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {order.status === 'Pending' ? 'প্রসেসিং' : order.status === 'Success' ? 'সফল' : 'বাতিল'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;
