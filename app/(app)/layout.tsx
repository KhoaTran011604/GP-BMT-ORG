'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import {
  LayoutDashboard,
  Church,
  Users,
  Wallet,
  UserCog,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Bell,
  CreditCard,
  Receipt,
  Briefcase,
  FileSignature,
  DollarSign,
  Cross,
  FolderOpen,
  Landmark,
  Shield,
  History,
  User,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: string;
  children?: MenuItem[];
  roles?: string[]; // Roles that can access this menu item
}

const menuData: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Tổng quan',
    icon: <LayoutDashboard size={24} />,
    href: '/dashboard',
    roles: ['super_admin', 'cha_quan_ly', 'cha_xu', 'ke_toan'], // All roles
  },
  {
    id: 'parish',
    label: 'Giáo xứ',
    icon: <Church size={24} />,
    href: '/parish',
    roles: ['super_admin', 'cha_quan_ly', 'cha_xu'], // Only Super Admin and Cha Quản lý
  },
  {
    id: 'people',
    label: 'Giáo dân',
    icon: <Users size={24} />,
    href: '/people',
  },
  {
    id: 'finance',
    label: 'Quản lý Tài chính',
    icon: <Wallet size={24} />,
    children: [
      { id: 'funds', label: 'Danh mục Quỹ', icon: <CreditCard size={22} />, href: '/finance/funds' },
      { id: 'expense-categories', label: 'Danh mục Thu Chi', icon: <FolderOpen size={22} />, href: '/finance/expense-categories' },
      { id: 'bank-accounts', label: 'Tài khoản Ngân hàng', icon: <Landmark size={22} />, href: '/finance/bank-accounts' },
      { id: 'contacts', label: 'Đối tượng Nhận gửi', icon: <Users size={22} />, href: '/admin/contacts' },
      { id: 'transactions', label: 'Quản lý Giao dịch', icon: <Receipt size={22} />, href: '/finance/transactions' },
    ],
    roles: ['super_admin', 'cha_quan_ly', 'cha_xu', 'ke_toan'], // All roles except thu_ky
  },
  {
    id: 'hr',
    label: 'Nhân sự & Tiền lương',
    icon: <Briefcase size={24} />,
    children: [
      { id: 'staff', label: 'Danh sách Nhân sự', icon: <UserCog size={22} />, href: '/hr/staff' },
      { id: 'payroll', label: 'Bảng lương', icon: <DollarSign size={22} />, href: '/hr/payroll' },
    ],
    roles: ['super_admin', 'cha_quan_ly', 'ke_toan'], // Super Admin, Cha Quản lý, and Kế toán
  },
  {
    id: 'admin',
    label: 'Hành chính & Tài sản',
    icon: <FolderOpen size={24} />,
    children: [
      { id: 'assets', label: 'Quản lý Tài sản', icon: <Landmark size={22} />, href: '/admin/assets' },
      { id: 'rental-contracts', label: 'Hợp đồng Cho thuê', icon: <FileSignature size={22} />, href: '/admin/rental-contracts' },
    ],
    roles: ['super_admin', 'cha_quan_ly', 'cha_xu'], // Super Admin, Cha Quản lý, and Cha xứ
  },
  {
    id: 'settings',
    label: 'Cài đặt Hệ thống',
    icon: <Settings size={24} />,
    children: [
      { id: 'users', label: 'Phân quyền (RBAC)', icon: <Shield size={22} />, href: '/settings/users' },
       { id: 'audit-logs', label: 'Nhật ký hệ thống', icon: <History size={22} />, href: '/settings/audit-logs' },
    ],
    roles: ['super_admin'], // Only Super Admin
  },
];

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  cha_quan_ly: 'Cha Quản lý',
  cha_xu: 'Cha xứ',
  ke_toan: 'Kế toán VP',
  thu_ky: 'Thư ký GX',
};

// Filter menu items based on user role
function filterMenuByRole(menuItems: MenuItem[], userRole: string): MenuItem[] {
  return menuItems
    .filter((item) => {
      // If no roles specified, show to all (backward compatibility)
      if (!item.roles || item.roles.length === 0) return true;
      return item.roles.includes(userRole);
    })
    .map((item) => {
      // Recursively filter children if they exist
      if (item.children) {
        return {
          ...item,
          children: item.children.filter((child) => {
            if (!child.roles || child.roles.length === 0) return true;
            return child.roles.includes(userRole);
          }),
        };
      }
      return item;
    })
    .filter((item) => {
      // Remove items with no children if they had children but all were filtered out
      if (item.children && item.children.length === 0) return false;
      return true;
    });
}

function MenuItem({
  item,
  isCollapsed,
  expanded,
  onToggle,
  pathname,
}: {
  item: MenuItem;
  isCollapsed: boolean;
  expanded: string[];
  onToggle: (id: string) => void;
  pathname: string;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expanded.includes(item.id);
  const isActive = item.href === pathname || item.children?.some((c) => c.href === pathname);
  const isChildActive = item.children?.some((c) => c.href === pathname);

  if (isCollapsed && hasChildren) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`w-full flex items-center justify-center p-4 rounded-xl transition-all duration-200
              ${isActive ? 'bg-white/20 text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
            {item.icon}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-64 ml-2">
          <div className="px-3 py-2 text-base font-semibold text-gray-700">{item.label}</div>
          <DropdownMenuSeparator />
          {item.children?.map((child) => (
            <DropdownMenuItem key={child.id} asChild className="py-3">
              <Link href={child.href || '#'} className="flex items-center gap-3 text-base">
                {child.icon}
                {child.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (isCollapsed) {
    return (
      <Link
        href={item.href || '#'}
        className={`flex items-center justify-center p-4 rounded-xl transition-all duration-200
          ${isActive ? 'bg-white/20 text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
        title={item.label}
      >
        {item.icon}
      </Link>
    );
  }

  return (
    <div>
      {hasChildren ? (
        <button
          onClick={() => onToggle(item.id)}
          className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200
            ${isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
        >
          <div className="flex items-center gap-4">
            <span className={`transition-colors ${isActive ? 'text-white' : ''}`}>{item.icon}</span>
            <span className="text-base font-medium">{item.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {item.badge && (
              <span className="text-xs px-2 py-1 bg-white/20 rounded-full">{item.badge}</span>
            )}
            <ChevronDown
              size={20}
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
        </button>
      ) : (
        <Link
          href={item.href || '#'}
          className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200
            ${isActive ? 'bg-white/20 text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
        >
          {item.icon}
          <span className="text-base font-medium">{item.label}</span>
        </Link>
      )}

      {/* Submenu */}
      {hasChildren && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="ml-5 mt-2 pl-5 border-l-2 border-gray-700 space-y-2">
            {item.children?.map((child) => {
              const isChildItemActive = child.href === pathname;
              return (
                <Link
                  key={child.id}
                  href={child.href || '#'}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg text-base transition-all duration-200
                    ${isChildItemActive
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                >
                  {child.icon}
                  <span>{child.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expanded, setExpanded] = useState<string[]>(['finance']);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-expand menu based on current path
  useEffect(() => {
    const filteredMenu = filterMenuByRole(menuData, user?.role || '');
    filteredMenu.forEach((item) => {
      if (item.children?.some((c) => c.href === pathname)) {
        if (!expanded.includes(item.id)) {
          setExpanded((prev) => [...prev, item.id]);
        }
      }
    });
  }, [pathname, user?.role]);

  const handleToggle = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Đang tải...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col
          ${sidebarOpen ? 'w-80' : 'w-24'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-gray-900
          transition-all duration-300 ease-in-out shadow-2xl`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Cross className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="font-bold text-white text-xl">GPBMT.ORG</h1>
                  <p className="text-sm text-white/60">Giáo phận Buôn Ma Thuột</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="m-auto p-3 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white hidden lg:block"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin scrollbar-thumb-white/20">
          {filterMenuByRole(menuData, user?.role || '').map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              isCollapsed={!sidebarOpen}
              expanded={expanded}
              onToggle={handleToggle}
              pathname={pathname}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          {sidebarOpen ? (
            <div className="flex items-center justify-between text-xs text-white/40">
              <span>Version 1.0 MVP</span>
              <span>© 2026 TGM BMT</span>
            </div>
          ) : (
            <div className="text-center text-xs text-white/40">v1.0</div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header - Simplified for elderly users */}
        <header className="bg-white border-b border-gray-200 px-5 lg:px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-3 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu size={28} />
            </button>

            {/* Page Title - Larger font for elderly */}
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                Hệ thống Quản lý Giáo phận
              </h2>
              <p className="text-base text-gray-500 hidden sm:block">
                {new Date().toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
            {/* Notifications - Larger button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-3 hover:bg-gray-100 rounded-xl transition-colors">
                  <Bell size={24} className="text-gray-600" />
                  <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-lg">Thông báo</h3>
                </div>
                <div className="p-5 text-center text-gray-500 text-base">
                  Không có thông báo mới
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu (Desktop) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden lg:flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-gray-900 text-white text-sm">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden xl:block">
                    <p className="text-md font-medium text-gray-700">{user.fullName}</p>
                    <p className="text-sm text-gray-500">{roleLabels[user.role]}</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2 border-b">
                  <p className="font-lg">{user.fullName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">
                    <User size={20} className="mr-2" /> Hồ sơ cá nhân
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/account">
                    <Settings size={16} className="mr-2" /> Cài đặt tài khoản
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut size={16} className="mr-2" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-5 lg:p-8 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
