import { LucideIcon } from 'lucide-react';

export interface InputGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: LucideIcon;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface PersonalInfoState {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  country: string;
  city: string;
}

export interface SecurityState {
  currentPass: string;
  newPass: string;
  confirmPass: string;
}

export type TabType = 'personal' | 'security';