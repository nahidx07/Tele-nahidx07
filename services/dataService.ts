
import { Offer, Order, User, DepositRequest, TransferRequest, PaymentMethod, AppConfig, Notification } from '../types';
import { STORAGE_KEYS } from '../constants';

const initialConfig: AppConfig = {
  version: '1.0.0',
  downloadUrl: 'https://example.com/app.apk',
  isUpdateMandatory: false,
  notice: 'টেলিকম বাংলায় স্বাগতম!',
  tgBotToken: '',
  tgAdminChatId: ''
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

const sendTelegramNotification = async (message: string) => {
  const config = dataService.getConfig();
  if (!config.tgBotToken || !config.tgAdminChatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${config.tgBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.tgAdminChatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
  } catch (e) {
    console.error("Telegram Notify Error:", e);
  }
};

export const dataService = {
  // Notifications / Broadcasts
  getNotifications: (): Notification[] => JSON.parse(localStorage.getItem('tb_notifications') || '[]'),
  saveNotification: (n: Notification) => {
    const list = dataService.getNotifications();
    list.unshift(n);
    localStorage.setItem('tb_notifications', JSON.stringify(list));
  },
  markAllAsRead: () => {
    const list = dataService.getNotifications().map(n => ({ ...n, isRead: true }));
    localStorage.setItem('tb_notifications', JSON.stringify(list));
  },

  // Config
  getConfig: (): AppConfig => {
    const saved = localStorage.getItem('tb_config');
    return saved ? JSON.parse(saved) : initialConfig;
  },
  saveConfig: (config: AppConfig) => localStorage.setItem('tb_config', JSON.stringify(config)),

  // Users
  getUsers: (): User[] => {
    const saved = localStorage.getItem('tb_users');
    if (!saved) {
      const admin = { id: 'admin_1', name: 'Admin', phone: '01700000000', balance: 100000, role: 'admin' as const };
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
      users.push(user);
      localStorage.setItem('tb_users', JSON.stringify(users));
    }
  },
  deleteUser: (id: string) => {
    const users = dataService.getUsers().filter(u => u.id !== id);
    localStorage.setItem('tb_users', JSON.stringify(users));
  },
  getUser: (): User | null => JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null'),

  // Offers
  getOffers: (): Offer[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFERS) || '[]'),
  saveOffer: (offer: Offer) => {
    const offers = dataService.getOffers();
    const idx = offers.findIndex(o => o.id === offer.id);
    idx > -1 ? offers[idx] = offer : offers.push(offer);
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
  },
  deleteOffer: (id: string) => {
    const offers = dataService.getOffers().filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
  },

  // Orders
  getOrders: (): Order[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]'),
  
  // Fix: Added getUserOrders to resolve Property 'getUserOrders' does not exist error
  getUserOrders: (userId: string): Order[] => {
    const orders = dataService.getOrders();
    return orders.filter(o => o.userId === userId);
  },

  createOrder: (order: Order) => {
    const orders = dataService.getOrders();
    orders.unshift(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    sendTelegramNotification(`<b>🆕 নতুন অর্ডার!</b>\n\nঅফার: ${order.offerTitle}\nইউজার: ${order.userName}\nনম্বর: ${order.phoneNumber}\nমূল্য: ৳${order.price}`);
  },
  updateOrderStatus: (id: string, status: Order['status']) => {
    const orders = dataService.getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx > -1) {
      const order = orders[idx];
      if (status === 'Cancelled' && order.status === 'Pending') {
        const users = dataService.getUsers();
        const uIdx = users.findIndex(u => u.id === order.userId);
        if (uIdx > -1) {
          users[uIdx].balance += order.price;
          localStorage.setItem('tb_users', JSON.stringify(users));
          syncSessionUser(order.userId);
        }
      }
      orders[idx].status = status;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  },

  // Deposit Requests
  getDeposits: (): DepositRequest[] => JSON.parse(localStorage.getItem('tb_deposits') || '[]'),
  createDeposit: (req: DepositRequest) => {
    const reqs = dataService.getDeposits();
    reqs.unshift(req);
    localStorage.setItem('tb_deposits', JSON.stringify(reqs));
    sendTelegramNotification(`<b>💰 অ্যাড মানি রিকোয়েস্ট!</b>\n\nইউজার: ${req.userName}\nপরিমাণ: ৳${req.amount}\nপদ্ধতি: ${req.method}\nTrxID: <code>${req.trxId}</code>`);
  },
  updateDepositStatus: (id: string, status: DepositRequest['status']) => {
    const reqs = dataService.getDeposits();
    const idx = reqs.findIndex(r => r.id === id);
    if (idx > -1) {
      if (status === 'Success' && reqs[idx].status === 'Pending') {
         const users = dataService.getUsers();
         const uIdx = users.findIndex(u => u.id === reqs[idx].userId);
         if (uIdx > -1) {
            users[uIdx].balance += reqs[idx].amount;
            localStorage.setItem('tb_users', JSON.stringify(users));
            syncSessionUser(reqs[idx].userId);
         }
      }
      reqs[idx].status = status;
      localStorage.setItem('tb_deposits', JSON.stringify(reqs));
    }
  },

  getPaymentMethods: (): PaymentMethod[] => JSON.parse(localStorage.getItem('tb_payments') || '[]'),
  savePaymentMethod: (pm: PaymentMethod) => {
    const pms = dataService.getPaymentMethods();
    const idx = pms.findIndex(p => p.id === pm.id);
    idx > -1 ? pms[idx] = pm : pms.push(pm);
    localStorage.setItem('tb_payments', JSON.stringify(pms));
  },
  deletePaymentMethod: (id: string) => {
    const pms = dataService.getPaymentMethods().filter(p => p.id !== id);
    localStorage.setItem('tb_payments', JSON.stringify(pms));
  },

  getTransfers: (): TransferRequest[] => JSON.parse(localStorage.getItem('tb_transfers') || '[]'),
  createTransfer: (req: TransferRequest) => {
    const reqs = dataService.getTransfers();
    reqs.unshift(req);
    localStorage.setItem('tb_transfers', JSON.stringify(reqs));
    sendTelegramNotification(`<b>💸 উইথড্র রিকোয়েস্ট!</b>\n\nইউজার: ${req.userName}\nপরিমাণ: ৳${req.amount}\nপ্রোভাইডার: ${req.provider}\nনম্বর: ${req.number}`);
    const users = dataService.getUsers();
    const uIdx = users.findIndex(u => u.id === req.userId);
    if (uIdx > -1) {
      users[uIdx].balance -= req.amount;
      localStorage.setItem('tb_users', JSON.stringify(users));
      syncSessionUser(req.userId);
    }
  },
  updateTransferStatus: (id: string, status: TransferRequest['status']) => {
    const reqs = dataService.getTransfers();
    const idx = reqs.findIndex(r => r.id === id);
    if (idx > -1) {
      if (status === 'Cancelled' && reqs[idx].status === 'Pending') {
        const users = dataService.getUsers();
        const uIdx = users.findIndex(u => u.id === reqs[idx].userId);
        if (uIdx > -1) {
          users[uIdx].balance += reqs[idx].amount;
          localStorage.setItem('tb_users', JSON.stringify(users));
          syncSessionUser(reqs[idx].userId);
        }
      }
      reqs[idx].status = status;
      localStorage.setItem('tb_transfers', JSON.stringify(reqs));
    }
  },
  
  updateUserBalance: (amount: number) => {
    const user = dataService.getUser();
    if (!user) return;
    const users = dataService.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx > -1) {
      users[idx].balance += amount;
      localStorage.setItem('tb_users', JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(users[idx]));
    }
  }
};
