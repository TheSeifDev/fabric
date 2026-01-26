// src/app/(components)/dashboard/RecentRolls.tsx
import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const recentRollsData = [
  { id: '#ROLL-2049', type: 'Cotton 400TC', weight: '240kg', status: 'Completed', date: '2 min ago' },
  { id: '#ROLL-2048', type: 'Polyester Blend', weight: '180kg', status: 'Processing', date: '15 min ago' },
  { id: '#ROLL-2047', type: 'Silk Touch', weight: '120kg', status: 'Pending', date: '1 hour ago' },
  { id: '#ROLL-2046', type: 'Linen Pure', weight: '300kg', status: 'Completed', date: '3 hours ago' },
  { id: '#ROLL-2045', type: 'Cotton 200TC', weight: '210kg', status: 'Alert', date: '5 hours ago' },
];

const RecentRolls = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Recent Rolls</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="pb-3 pl-2">Roll ID</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Weight</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentRollsData.map((roll) => (
              <tr key={roll.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="py-4 pl-2 font-medium text-gray-900">{roll.id}</td>
                <td className="py-4 text-gray-500">{roll.type}</td>
                <td className="py-4 text-gray-500">{roll.weight}</td>
                <td className="py-4">
                  <span className={`
                    px-2.5 py-1 rounded-full text-xs font-medium
                    ${roll.status === 'Completed' ? 'bg-green-100 text-green-700' : ''}
                    ${roll.status === 'Processing' ? 'bg-blue-100 text-blue-700' : ''}
                    ${roll.status === 'Pending' ? 'bg-gray-100 text-gray-700' : ''}
                    ${roll.status === 'Alert' ? 'bg-red-100 text-red-700' : ''}
                  `}>
                    {roll.status}
                  </span>
                </td>
                <td className="py-4 text-right pr-2">
                  <button className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentRolls;