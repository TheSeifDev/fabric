'use client';

import React from 'react';
import { Bell, Menu, Settings, Sun, Search } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  return (
    <nav className="flex justify-between items-center w-full mb-7 px-4 py-3 bg-white/50 backdrop-blur-md border-b border-gray-100 sticky top-7 z-30 rounded-lg shadow-sm">
      {/* Left Section: Toggle & Search */}
      <div className="flex items-center gap-4 ">
        <button
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
          onClick={toggleSidebar}
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="search"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
          <Sun size={20} />
        </button>

        <div className="relative">
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell size={20} />
          </button>
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        </div>

        <Link href="/settings">
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
            <Settings size={20} />
          </button>
        </Link>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold border border-blue-200 shrink-0">
                <span className="text-xs">JD</span>
            </div>
            <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700 leading-none">John Doe</p>
                <p className="text-xs text-gray-500 mt-0.5">Admin</p>
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;