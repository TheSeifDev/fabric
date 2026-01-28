'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  PlusCircle,
  Settings,
  ChevronLeft,
  LogOut,
  User,
  Users,
  Shield,
  BookOpen,
  FileText,
  LucideIcon
} from 'lucide-react';

// --- 1. Configuration & Types ---

// Define Roles
type UserRole = 'admin' | 'storekeeper' | 'viewer';

// Mock Current User (Change this to 'storekeeper' to test hidden sections)
const CURRENT_USER_ROLE: UserRole = 'admin'; 

interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[]; 
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

// --- 2. Navigation Data Structure (Updated) ---
const menuSections: MenuSection[] = [
  {
    title: 'Main',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'storekeeper', 'viewer'] },
      { name: 'Rolls', href: '/rolls', icon: Package, roles: ['admin', 'storekeeper', 'viewer'] },
      { name: 'Add Roll', href: '/rolls/add', icon: PlusCircle, roles: ['admin', 'storekeeper'] },
    ],
  },
  {
    title: 'Management',
    items: [
      { name: 'Catalogs', href: '/catalogs', icon: BookOpen, roles: ['admin', 'storekeeper'] },
    ],
  },
  {
    // NEW SECTION: Administration (الادارة)
    title: 'Administration',
    items: [
      { name: 'Users', href: '/settings/users', icon: Users, roles: ['admin'] },
      { name: 'Roles', href: '/settings/roles', icon: Shield, roles: ['admin'] },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'Reports', href: '/reports', icon: FileText, roles: ['admin', 'storekeeper'] },
      { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'storekeeper', 'viewer'] },
    ],
  },
];

// --- 3. Components ---

interface SidebarProps {
  open: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ open, toggleSidebar }: SidebarProps) => {
  const pathname = usePathname();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Logging out...');
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300 ${
          open ? 'opacity-100 visible' : 'opacity-0 invisible'
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
        <div className={`h-16 flex items-center border-b border-gray-100 shrink-0 ${open ? 'justify-between px-6' : 'justify-center'}`}>
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

        {/* Navigation Content */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 scrollbar-hide">
          {menuSections.map((section, sectionIdx) => {
            // Filter items based on Role
            const filteredItems = section.items.filter(item => item.roles.includes(CURRENT_USER_ROLE));
            
            // If no items in this section are allowed, skip rendering the section completely
            if (filteredItems.length === 0) return null;

            return (
              <div key={sectionIdx}>
                {/* Section Header (Only visible when Open) */}
                {open ? (
                  <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 animate-in fade-in duration-300">
                    {section.title}
                  </h3>
                ) : (
                  // Divider when closed
                  <div className="border-t border-gray-100 mx-2 my-2" />
                )}

                {/* Section Items */}
                <ul className="space-y-1">
                  {filteredItems.map((item) => (
                    <SidebarItem 
                      key={item.href} 
                      item={item} 
                      isOpen={open} 
                      isActive={pathname === item.href} 
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Footer / User Profile */}
        <div className="border-t border-gray-100 p-3 shrink-0">
          <Link
            href="/profile"
            className={`
              flex items-center gap-3 w-full p-2 rounded-xl transition-colors hover:bg-gray-50 group
              ${open ? '' : 'justify-center'}
            `}
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden relative">
              <User size={20} className="text-gray-500" />
            </div>

            <div className={`text-left overflow-hidden whitespace-nowrap transition-all duration-300 ${open ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'}`}>
              <p className="text-sm font-semibold text-gray-700">Jane Doe</p>
              <p className="text-xs text-gray-400 capitalize">{CURRENT_USER_ROLE}</p>
            </div>

            {open && (
              <div
                role="button"
                onClick={handleLogout}
                className="ml-auto p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
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

// --- 4. Sub-Component: Sidebar Item ---

interface SidebarItemProps {
  item: MenuItem;
  isOpen: boolean;
  isActive: boolean;
}

const SidebarItem = ({ item, isOpen, isActive }: SidebarItemProps) => {
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        className={`
          relative flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200
          group overflow-hidden whitespace-nowrap
          ${isActive 
            ? 'bg-blue-50 text-blue-600' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }
          ${!isOpen && 'justify-center'} 
        `}
      >
        <div className="shrink-0 relative">
          <Icon
            size={22}
            className={`transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}
          />
        </div>

        <span
          className={`
            transition-all duration-300 ease-in-out
            ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 w-0 hidden'}
          `}
        >
          {item.name}
        </span>

        {isActive && isOpen && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-blue-600 rounded-l-full" />
        )}

        {/* Floating Tooltip */}
        {!isOpen && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
            {item.name}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 w-2 h-2 bg-gray-900 transform rotate-45" />
          </div>
        )}
      </Link>
    </li>
  );
};

export default Sidebar;