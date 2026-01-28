import React from 'react';
import { Camera, Mail } from 'lucide-react';

export const ProfileHeader = () => {
  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-6">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
          <span className="text-2xl font-bold text-blue-600">JD</span>
        </div>
        <button 
          className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors shadow-sm"
          aria-label="Change profile photo"
        >
          <Camera size={14} />
        </button>
      </div>

      <div className="text-center md:text-left">
        <h1 className="text-2xl font-bold text-gray-900">John Doe</h1>
        <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mt-1">
          <Mail size={16} /> john.doe@example.com
        </p>
        <div className="mt-3 flex gap-2 justify-center md:justify-start">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">Admin</span>
          <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">Active</span>
        </div>
      </div>
    </div>
  );
};