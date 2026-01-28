import React from 'react';
import { User, Calendar, MapPin, Globe, Mail } from 'lucide-react';
import { PersonalInfoState } from '../types';
import { InputGroup } from './InputGroup';

interface Props {
  data: PersonalInfoState;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean; // استقبال الحالة
}

export const PersonalForm = ({ data, onChange, isEditing }: Props) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">

    <InputGroup
      disabled={!isEditing}
      label="Full Name (English)"
      name="fullName"
      value={data.fullName}
      onChange={onChange}
      icon={User}
    />

    <InputGroup
      disabled={!isEditing}
      label="Email Address"
      name="email"
      type="email"
      value={data.email}
      onChange={onChange}
      icon={Mail}
    />

    <InputGroup
      disabled={!isEditing}
      label="Phone Number"
      name="phone"
      value={data.phone}
      onChange={onChange}
      icon={User}
    />

    <InputGroup
      disabled={!isEditing}
      label="Date of Birth"
      name="dob"
      type="date"
      value={data.dob}
      onChange={onChange}
      icon={Calendar}
    />

    <InputGroup
      disabled={!isEditing}
      label="Address"
      name="address"
      value={data.address}
      onChange={onChange}
      icon={MapPin}
    />

    <InputGroup
      disabled={!isEditing}
      label="Country"
      name="country"
      value={data.country}
      onChange={onChange}
      icon={Globe}
    />

    <InputGroup
      disabled={!isEditing}
      label="City"
      name="city"
      value={data.city}
      onChange={onChange}
      icon={MapPin}
    />

  </div>
);