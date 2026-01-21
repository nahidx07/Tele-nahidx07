
export type Operator = 'GP' | 'Robi' | 'Banglalink' | 'Airtel' | 'Teletalk';

export interface Offer {
  id: string;
  operator: Operator;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  duration: string;
  category: 'ড্রাইভ' | 'মিনিট' | 'বান্ডেল';
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

export interface User {
  id: string;
  name: string;
  phone: string;
  balance: number;
  role: 'user' | 'admin';
  isBanned?: boolean;
  avatarUrl?: string;
  email?: string;
  telegramId?: string;
  referralCode: string;
  referredBy?: string;
  hasMadeFirstDeposit?: boolean;
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

export interface PaymentMethod {
  id: string;
  provider: string;
  type: string;
  number: string;
}

export interface AppConfig {
  version: string;
  downloadUrl: string;
  telegramUrl: string;
  botToken: string;
  adminChatId: string;
  isUpdateMandatory: boolean;
  notice: string;
  logoUrl: string;
  termsContent: string;
  privacyContent: string;
  refundContent: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: 'broadcast' | 'system' | 'offer';
  isRead: boolean;
}
