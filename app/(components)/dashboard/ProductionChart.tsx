// src/app/(components)/dashboard/ProductionChart.tsx
import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export const ProductionOverview = () => {
  // Mock data for visual bars
  const bars = [40, 70, 45, 90, 60, 80, 50]; 
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Production Output</h3>
      
      {/* Visual Chart Area */}
      <div className="flex items-end justify-between gap-2 h-48 mt-auto px-2">
        {bars.map((height, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
            <div 
              className="w-full bg-blue-100 rounded-t-md relative group-hover:bg-blue-200 transition-all duration-300" 
              style={{ height: `${height}%` }}
            >
              {/* Tooltip on hover */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {height} tons
              </div>
            </div>
            <span className="text-xs text-gray-400 font-medium">{days[idx]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AlertsWidget = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">System Alerts</h3>
        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">2 New</span>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3 items-start p-3 bg-red-50 rounded-xl border border-red-100">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-sm font-semibold text-red-700">Machine B2 Overheat</h4>
            <p className="text-xs text-red-600/80 mt-1">Temperature reached 180°C. Maintenance required.</p>
          </div>
        </div>
        
        <div className="flex gap-3 items-start p-3 bg-green-50 rounded-xl border border-green-100">
            <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={18} />
             <div>
            <h4 className="text-sm font-semibold text-green-700">Maintenance Complete</h4>
            <p className="text-xs text-green-600/80 mt-1">Roll #2040 checkup done successfully.</p>
          </div>
        </div>
      </div>
    </div>
  );
};