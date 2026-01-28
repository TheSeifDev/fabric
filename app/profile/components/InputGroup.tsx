import React from 'react';
import { InputGroupProps } from '../types';

export const InputGroup = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  icon: Icon,
  placeholder,
  disabled
}: InputGroupProps) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative">
      <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${disabled ? 'text-gray-400' : 'text-gray-500'} pointer-events-none`}>
        <Icon size={18} />
      </div>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled} // تفعيل خاصية القفل
        placeholder={placeholder}
        className={`
          w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-all
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
          ${disabled 
            ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed' // شكل وضع القراءة
            : 'bg-white text-gray-900 border-gray-200 placeholder:text-gray-400' // شكل وضع التعديل
          }
        `}
      />
    </div>
  </div>
);