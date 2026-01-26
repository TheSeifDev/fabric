'use client';

import React from 'react';
import {
  Home,
  Package,
  PlusCircle,
  Settings,
  ChevronLeft,
  LogOut,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Rolls', href: '/rolls', icon: Package },
  { name: 'Add Roll', href: '/rolls/add', icon: PlusCircle },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ open, toggleSidebar }: SidebarProps) => {
  const pathname = usePathname();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to profile
    e.stopPropagation();
    // Add your logout logic here (e.g., signOut())
    console.log('Logging out...');
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300 ${open ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:static z-50 h-screen bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out flex flex-col shrink-0
          ${open ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'}
        `}
      >
        {/* Header / Logo */}
        <div
          className={`
            h-16 flex items-center border-b border-gray-100 shrink-0
            ${open ? 'justify-between px-4' : 'justify-center'} 
          `}
        >
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${open ? 'w-full' : 'w-auto'}`}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200 shrink-0">
              <span className="text-xl font-bold">F</span>
            </div>
            <div className={`flex flex-col whitespace-nowrap transition-all duration-300 ${open ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
              <span className="font-bold text-gray-800 text-lg tracking-tight">Fabric</span>
            </div>
          </div>

          <button
            onClick={toggleSidebar}
            className={`md:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 ${!open && 'hidden'}`}
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 scrollbar-hide">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200
                  group overflow-hidden whitespace-nowrap
                  ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <div className="shrink-0">
                  <Icon
                    size={22}
                    className={`transition-colors duration-200 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                  />
                </div>
                <span className={`transition-all duration-300 ease-in-out ${open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 w-0 overflow-hidden'}`}>
                  {link.name}
                </span>
                {active && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-blue-600 rounded-l-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / User Profile */}
        <div className="border-t border-gray-100 p-3 shrink-0">
          <Link
            href="/profile"
            className={`
              flex items-center gap-3 w-full p-2 rounded-xl transition-colors hover:bg-gray-50
              ${open ? '' : 'justify-center'}
            `}
          >
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0 border border-white shadow-sm overflow-hidden">
              <User size={18} className="text-gray-500" />
            </div>

            <div
              className={`text-left overflow-hidden whitespace-nowrap transition-all duration-300 ${open ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'
                }`}
            >
              <p className="text-sm font-semibold text-gray-700">Jane Doe</p>
              <p className="text-xs text-gray-400">View Profile</p>
            </div>

            {/* Logout Button (Stop Propagation prevents navigating to /profile) */}
            {open && (
              <div
                role="button"
                onClick={handleLogout}
                className="ml-auto p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </div>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;