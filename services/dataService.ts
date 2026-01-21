
import { Offer, Order, User, DepositRequest, AppConfig, Notification, PaymentMethod } from '../types';
import { STORAGE_KEYS } from '../constants';

const initialConfig: AppConfig = {
  version: '1.0.6',
  downloadUrl: 'https://example.com/app.apk',
  telegramUrl: 'https://t.me/example',
  botToken: '',
  adminChatId: '',
  masterAdminEmail: 'admin@gmail.com', // Default master admin
  isUpdateMandatory: false,
  notice: 'টেলিকম বাংলায় স্বাগতম!',
  logoUrl: 'https://cdn-icons-png.flaticon.com/512/3661/3661313.png',
  termsContent: 'আমাদের সার্ভিস ব্যবহারের শর্তাবলী এখানে থাকবে...',
  privacyContent: 'আমাদের প্রাইভেসি পলিসি এখানে থাকবে...',
  refundContent: 'আমাদের রিফান্ড পলিসি এখানে থাকবে...'
};

const syncSessionUser = (userId: string) => {
  const sessionUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
  if (sessionUser && sessionUser.id === userId) {
    const users = dataService.getUsers();
    const updated = users.find(u => u.id === userId);
    if (updated) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
  }
};

export const dataService = {
  getNotifications: (): Notification[] => JSON.parse(localStorage.getItem('tb_notifications') || '[]'),
  saveNotification: (n: Notification) => {
    const list = dataService.getNotifications();
    list.unshift(n);
    localStorage.setItem('tb_notifications', JSON.stringify(list));
  },
  markAllAsRead: () => {
    const notifications = dataService.getNotifications();
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    localStorage.setItem('tb_notifications', JSON.stringify(updated));
  },
  
  sendTelegramNotification: async (message: string) => {
    const config = dataService.getConfig();
    if (!config.botToken || !config.adminChatId) return;
    try {
      await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.adminChatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
    } catch (e) { console.error('Telegram notification failed', e); }
  },

  getConfig: (): AppConfig => {
    const saved = localStorage.getItem('tb_config');
    return saved ? JSON.parse(saved) : initialConfig;
  },
  saveConfig: (config: AppConfig) => localStorage.setItem('tb_config', JSON.stringify(config)),

  getUsers: (): User[] => {
    const saved = localStorage.getItem('tb_users');
    if (!saved) {
      const config = dataService.getConfig();
      const admin = { id: 'admin_1', name: 'Admin', phone: '01700000000', balance: 0, role: 'admin' as const, email: config.masterAdminEmail, referralCode: 'ADMIN123' };
      localStorage.setItem('tb_users', JSON.stringify([admin]));
      return [admin];
    }
    return JSON.parse(saved);
  },
  updateUser: (user: User) => {
    const users = dataService.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx > -1) {
      users[idx] = user;
      localStorage.setItem('tb_users', JSON.stringify(users));
      syncSessionUser(user.id);
    } else {
      if (!user.referralCode) user.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      users.push(user);
      localStorage.setItem('tb_users', JSON.stringify(users));
      dataService.sendTelegramNotification(`🆕 <b>নতুন মেম্বার জয়েন করেছে!</b>\n\nনাম: ${user.name}\nরেফার কোড: ${user.referralCode}`);
    }
  },
  toggleUserRole: (userId: string) => {
    const users = dataService.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx > -1) {
      users[idx].role = users[idx].role === 'admin' ? 'user' : 'admin';
      localStorage.setItem('tb_users', JSON.stringify(users));
      syncSessionUser(userId);
    }
  },
  getUser: (): User | null => JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null'),

  getOffers: (): Offer[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFERS) || '[]'),
  saveOffer: (offer: Offer) => {
    const offers = dataService.getOffers();
    const idx = offers.findIndex(o => o.id === offer.id);
    idx > -1 ? offers[idx] = offer : offers.push(offer);
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
  },

  getOrders: (): Order[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]'),
  createOrder: (order: Order) => {
    const orders = dataService.getOrders();
    orders.unshift(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    dataService.sendTelegramNotification(`🛒 <b>নতুন অফার অর্ডার!</b>\n\nইউজার: ${order.userName}\nঅফারের নাম: ${order.offerTitle}\nনম্বর: ${order.phoneNumber}\nদাম: ৳${order.price}`);
  },

  updateOrderStatus: (id: string, status: Order['status']) => {
    const orders = dataService.getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx > -1) {
      const order = orders[idx];
      if (order.status === 'Pending') {
        if (status === 'Cancelled') {
          dataService.updateUserBalanceById(order.userId, order.price);
        }
        order.status = status;
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        const emoji = status === 'Success' ? '✅' : '❌';
        dataService.sendTelegramNotification(`${emoji} <b>অর্ডার আপডেট!</b>\n\nইউজার: ${order.userName}\nঅফারের নাম: ${order.offerTitle}\nস্ট্যাটাস: ${status === 'Success' ? 'সফল' : 'বাতিল'}`);
      }
    }
  },

  createRecharge: (data: {userId: string, userName: string, phone: string, amount: number, operator: string}) => {
    dataService.updateUserBalanceById(data.userId, -data.amount);
    dataService.sendTelegramNotification(`📱 <b>নতুন রিচার্জ রিকোয়েস্ট!</b>\n\nইউজার: ${data.userName}\nঅপারেটর: ${data.operator}\nনম্বর: ${data.phone}\nপরিমাণ: ৳${data.amount}`);
  },

  createMoneyTransfer: (data: {userId: string, userName: string, phone: string, amount: number, method: string}) => {
    dataService.updateUserBalanceById(data.userId, -data.amount);
    dataService.sendTelegramNotification(`💸 <b>নতুন মানি ট্রান্সফার!</b>\n\nইউজার: ${data.userName}\nমেথড: ${data.method}\nনম্বর: ${data.phone}\nপরিমাণ: ৳${data.amount}`);
  },

  getDeposits: (): DepositRequest[] => JSON.parse(localStorage.getItem('tb_deposits') || '[]'),
  createDeposit: (req: DepositRequest) => {
    const reqs = dataService.getDeposits();
    reqs.unshift(req);
    localStorage.setItem('tb_deposits', JSON.stringify(reqs));
    dataService.sendTelegramNotification(`💰 <b>অ্যাড মানি রিকোয়েস্ট!</b>\n\nইউজার: ${req.userName}\nপরিমাণ: ৳${req.amount}\nTrxID: <code>${req.trxId}</code>`);
  },
  updateDepositStatus: (id: string, status: DepositRequest['status']) => {
    const reqs = dataService.getDeposits();
    const idx = reqs.findIndex(r => r.id === id);
    if (idx > -1) {
      if (status === 'Success' && reqs[idx].status === 'Pending') {
        const deposit = reqs[idx];
        dataService.updateUserBalanceById(deposit.userId, deposit.amount);
        
        // Referral Bonus Logic (First deposit only)
        const users = dataService.getUsers();
        const user = users.find(u => u.id === deposit.userId);
        if (user && !user.hasMadeFirstDeposit && user.referredBy) {
          const referrer = users.find(u => u.referralCode === user.referredBy);
          if (referrer) {
            dataService.updateUserBalanceById(referrer.id, 5);
            dataService.sendTelegramNotification(`🎁 <b>রেফার বোনাস!</b>\n\nরেফারার: ${referrer.name}\nবোনাস পেয়েছেন: ৳৫\nকার জন্য: ${user.name}-এর প্রথম ডিপোজিট.`);
          }
          user.hasMadeFirstDeposit = true;
          dataService.updateUser(user);
        }
      }
      reqs[idx].status = status;
      localStorage.setItem('tb_deposits', JSON.stringify(reqs));
    }
  },
  
  updateUserBalanceById: (userId: string, amount: number) => {
    const users = dataService.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx > -1) {
      users[idx].balance += amount;
      localStorage.setItem('tb_users', JSON.stringify(users));
      syncSessionUser(userId);
    }
  },

  getPaymentMethods: (): PaymentMethod[] => {
     const saved = localStorage.getItem('tb_payment_methods');
     if(!saved) {
       const defaults = [
         { id: '1', provider: 'bKash', type: 'Personal', number: '01700000000' },
         { id: '2', provider: 'Nagad', type: 'Personal', number: '01900000000' }
       ];
       localStorage.setItem('tb_payment_methods', JSON.stringify(defaults));
       return defaults;
     }
     return JSON.parse(saved);
  },
  getUserOrders: (userId: string): Order[] => dataService.getOrders().filter(o => o.userId === userId)
};
