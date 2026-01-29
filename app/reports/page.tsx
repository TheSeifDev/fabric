'use client';

import React from 'react';
import { FileBarChart } from 'lucide-react';
import { ReportStats } from './components/ReportStats';
import { ReportTemplates } from './components/ReportTemplates';
import { ReportHistory } from './components/ReportHistory';

const ReportsPage = () => {
  return (
    <div className="max-w-7xl mx-auto w-full pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileBarChart className="text-blue-600" />
            Reports & Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Generate insights, track inventory movements, and export data.
          </p>
        </div>
      </div>

      {/* 1. Statistics Overview */}
      <ReportStats />

      {/* 2. Quick Templates */}
      <ReportTemplates />

      {/* 3. Recent History Table */}
      <ReportHistory />

    </div>
  );
};

export default ReportsPage;