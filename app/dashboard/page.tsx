'use client';

import React from 'react';
import {
  Package,
  Users,
  Activity,
  AlertCircle,
  FileText,
  Download
} from 'lucide-react';
import StatCard from '../(components)/dashboard/StatCard';
import RecentRolls from '../(components)/dashboard/RecentRolls';
import { ProductionOverview, AlertsWidget } from '../(components)/dashboard/ProductionChart';
// Import the new component
import InventoryDistribution from '../(components)/dashboard/InventoryDistribution';

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-6 w-full">

      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, here is what&apos;s happening today.</p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
            <Download size={18} />
            Export Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-sm font-medium">
            <FileText size={18} />
            Create Report
          </button>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Rolls"
          value="1,248"
          trend="+12.5%"
          trendUp={true}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Production (Kg)"
          value="48,200"
          trend="+8.2%"
          trendUp={true}
          icon={Activity}
          color="purple"
        />
        <StatCard
          title="Active Users"
          value="24"
          trend="-2.4%"
          trendUp={false}
          icon={Users}
          color="green"
        />
        <StatCard
          title="System Alerts"
          value="3"
          trend="+1"
          trendUp={false}
          icon={AlertCircle}
          color="orange"
        />
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (2/3 width) - Charts & Tables */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ProductionOverview />
          <RecentRolls />
        </div>

        {/* Right Column (1/3 width) - Widgets */}
        <div className="flex flex-col gap-6">
          <AlertsWidget />

          {/* REPLACED: Upgrade Storage -> Inventory Distribution */}
          <InventoryDistribution />
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;