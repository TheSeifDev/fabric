import React from 'react';
import { Lock } from 'lucide-react';
import { SecurityState } from '../types';
import { InputGroup } from './InputGroup';

interface Props {
  data: SecurityState;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean;
}

export const SecurityForm = ({ data, onChange, isEditing }: Props) => (
  <div className="max-w-md space-y-6 animate-in fade-in duration-300">
    <InputGroup disabled={!isEditing} label="Current Password" name="currentPass" type="password" placeholder="Enter current password" value={data.currentPass} onChange={onChange} icon={Lock} />
    <div className="h-px bg-gray-100 my-4" />
    <InputGroup disabled={!isEditing} label="New Password" name="newPass" type="password" placeholder="Enter new password" value={data.newPass} onChange={onChange} icon={Lock} />
    <InputGroup disabled={!isEditing} label="Confirm Password" name="confirmPass" type="password" placeholder="Confirm new password" value={data.confirmPass} onChange={onChange} icon={Lock} />
  </div>
);