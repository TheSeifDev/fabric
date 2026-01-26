import React from 'react';
import { ChevronRight } from 'lucide-react';

const materials = [
  { name: 'Cotton 100%', count: 854, percentage: 45, color: 'bg-blue-500' },
  { name: 'Polyester Blend', count: 420, percentage: 30, color: 'bg-cyan-400' },
  { name: 'Pure Silk', count: 140, percentage: 15, color: 'bg-purple-500' },
  { name: 'Linen', count: 95, percentage: 10, color: 'bg-orange-400' },
];

const InventoryDistribution = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Inventory by Type</h3>
        <button className="text-gray-400 hover:text-blue-600 transition-colors">
            {/* Opens full detailed list */}
           <ChevronRight size={20} />
        </button>
      </div>

      <div className="space-y-5">
        {materials.map((item, index) => (
          <div key={index} className="group">
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
              <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-900">
                {item.count} Rolls
              </span>
            </div>
            
            {/* Progress Bar Background */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              {/* Actual Progress */}
              <div 
                className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`} 
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            
            <div className="text-right mt-1">
                <span className="text-[10px] text-gray-400">{item.percentage}% of total</span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
        View Full Inventory Report
      </button>
    </div>
  );
};

export default InventoryDistribution;