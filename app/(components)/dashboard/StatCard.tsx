// src/app/(components)/dashboard/StatCard.tsx
import React from 'react';
import { ArrowDownRight, ArrowUpRight, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

const StatCard = ({ title, value, trend, trendUp, icon: Icon, color }: StatCardProps) => {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      
      <div className="flex items-center mt-4 text-sm">
        <span className={`flex items-center font-medium ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
          {trendUp ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
          {trend}
        </span>
        <span className="text-gray-400 ml-2">vs last month</span>
      </div>
    </div>
  );
};

export default StatCard;