'use client';

import React from 'react';
// 1. Import LucideIcon type
import { Package, BarChart3, AlertTriangle, Users, ArrowRight, LucideIcon } from 'lucide-react';
import { ReportTemplate } from '../types';

const templates: ReportTemplate[] = [
  { 
    id: '1', 
    title: 'Current Inventory', 
    description: 'Detailed list of all rolls currently in stock by catalog.', 
    type: 'Inventory', 
    iconName: 'Package', 
    color: 'blue' 
  },
  { 
    id: '2', 
    title: 'Production Summary', 
    description: 'Rolls added and production output over the last 30 days.', 
    type: 'Production', 
    iconName: 'BarChart3', 
    color: 'purple' 
  },
  { 
    id: '3', 
    title: 'Low Stock Alerts', 
    description: 'Catalogs running low on stock based on thresholds.', 
    type: 'Alerts', 
    iconName: 'AlertTriangle', 
    color: 'orange' 
  },
  { 
    id: '4', 
    title: 'User Activity Log', 
    description: 'Audit log of user actions, edits, and deletions.', 
    type: 'Activity', 
    iconName: 'Users', 
    color: 'green' 
  },
];

// 2. Fix the type definition here
const iconMap: Record<string, LucideIcon> = { Package, BarChart3, AlertTriangle, Users };

export const ReportTemplates = () => {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Generate New Report</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {templates.map((t) => {
          const Icon = iconMap[t.iconName];
          const colorStyles = {
            blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
            purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
            orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
            green: 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white',
          };

          return (
            <button 
              key={t.id}
              className="group flex flex-col items-start text-left p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`p-3 rounded-xl mb-4 transition-colors ${colorStyles[t.color]}`}>
                <Icon size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{t.title}</h3>
              <p className="text-sm text-gray-500 mb-6 line-clamp-2">{t.description}</p>
              
              <div className="mt-auto flex items-center text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
                Generate
                <ArrowRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};