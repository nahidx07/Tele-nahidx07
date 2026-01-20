
export type Operator = 'GP' | 'Robi' | 'Banglalink' | 'Airtel' | 'Teletalk';

export interface Offer {
  id: string;
  operator: Operator;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  duration: string;
  category: 'ড্রাইভ' | 'ইন্টারনেট' | 'মিনিট' | 'বান্ডেল' | 'মাই অফার';
  isActive: boolean;
}

export interface Order {
  id: string;
  offerId: string;
  offerTitle: string;
  operator: Operator;
  phoneNumber: string;
  price: number;
  duration?: string;
  status: 'Pending' | 'Success' | 'Cancelled';
  timestamp: number;
  userId: string;
  userName?: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  method: string;
  amount: number;
  trxId: string;
  status: 'Pending' | 'Success' | 'Cancelled';
  timestamp: number;
}

export interface TransferRequest {
  id: string;
  userId: string;
  userName: string;
  provider: 'Bkash' | 'Nagad' | 'Rocket' | 'Upay';
  number: string;
  amount: number;
  status: 'Pending' | 'Success' | 'Cancelled';
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  balance: number;
  role: 'user' | 'admin';
  isBanned?: boolean;
  avatarUrl?: string;
  telegramId?: string;
  email?: string;
}

export interface PaymentMethod {
  id: string;
  provider: string;
  number: string;
  type: 'Personal' | 'Agent' | 'Payment';
}

export interface AppConfig {
  version: string;
  downloadUrl: string;
  isUpdateMandatory: boolean;
  notice: string;
  tgBotToken?: string;
  tgAdminChatId?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: 'broadcast' | 'system' | 'offer';
  isRead: boolean;
}
