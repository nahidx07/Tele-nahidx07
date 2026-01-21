
import React from 'react';
import { Operator } from './types';

export interface OperatorConfig {
  name: Operator;
  color: string; // Tailwind class
  hex: string;
  logo: string;
}

export const OPERATORS: OperatorConfig[] = [
  { name: 'GP', color: 'blue-600', hex: '#0076BE', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Grameenphone_Logo.svg/200px-Grameenphone_Logo.svg.png' },
  { name: 'Robi', color: 'red-600', hex: '#E21D25', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Robi_Axiata_Logo.svg/1200px-Robi_Axiata_Logo.svg.png' },
  { name: 'Banglalink', color: 'orange-500', hex: '#F37021', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Banglalink_Logo.svg/1200px-Banglalink_Logo.svg.png' },
  { name: 'Airtel', color: 'rose-600', hex: '#ED1C24', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Airtel_logo.svg/1200px-Airtel_logo.svg.png' },
  { name: 'Teletalk', color: 'green-600', hex: '#008D43', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/90/Teletalk_Logo.svg/1200px-Teletalk_Logo.svg.png' },
];

export const CATEGORIES = ['সব', 'ড্রাইভ', 'ইন্টারনেট', 'মিনিট', 'বান্ডেল'];

export const STORAGE_KEYS = {
  OFFERS: 'telecom_bangla_offers',
  ORDERS: 'telecom_bangla_orders',
  USER: 'telecom_bangla_user',
};
