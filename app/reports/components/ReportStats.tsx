'use client';

import React from 'react';
import { FileText, Download, Clock, AlertCircle, LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const StatCard = ({ label, value, icon: Icon, color, bg }: StatCardProps) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-xl ${bg} ${color} shrink-0`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  </div>
);

export const ReportStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        label="Total Reports"
        value="1,248"
        icon={FileText}
        color="text-blue-600"
        bg="bg-blue-50"
      />
      <StatCard
        label="Downloads (30d)"
        value="856"
        icon={Download}
        color="text-green-600"
        bg="bg-green-50"
      />
      <StatCard
        label="Scheduled"
        value="3 Active"
        icon={Clock}
        color="text-purple-600"
        bg="bg-purple-50"
      />
      <StatCard
        label="Failed Reports"
        value="0"
        icon={AlertCircle}
        color="text-orange-600"
        bg="bg-orange-50"
      />
    </div>
  );
};