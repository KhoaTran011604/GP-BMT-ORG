'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Search,
  User,
  Building,
  CreditCard,
  Receipt,
  Briefcase,
  FileSignature,
  DollarSign,
  Cross,
  FolderOpen,
  Landmark,
  Shield,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: string;
  children?: MenuItem[];
}

const menuData: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Tổng quan',
    icon: <LayoutDashboard size={20} />,
    href: '/dashboard',
  },
  {
    id: 'parish',
    label: 'Giáo xứ',
    icon: <Church size={20} />,
    href: '/parish',
  },
  {
    id: 'people',
    label: 'Giáo dân',
    icon: <Users size={20} />,
    children: [
      { id: 'people-list', label: 'Danh sách Giáo dân', icon: <User size={18} />, href: '/people' },
      { id: 'people-search', label: 'Tra cứu', icon: <Search size={18} />, href: '/people/search' },
    ],
  },
  {
    id: 'finance',
    label: 'Quản lý Tài chính',
    icon: <Wallet size={20} />,
    children: [
      { id: 'funds', label: 'Danh mục Quỹ', icon: <CreditCard size={18} />, href: '/finance/funds' },
      { id: 'expense-categories', label: 'Danh mục Thu Chi', icon: <FolderOpen size={18} />, href: '/finance/expense-categories' },
      { id: 'bank-accounts', label: 'Tài khoản Ngân hàng', icon: <Landmark size={18} />, href: '/finance/bank-accounts' },
      { id: 'transactions', label: 'Quản lý Giao dịch', icon: <Receipt size={18} />, href: '/finance/transactions' },
    ],
  },
  {
    id: 'hr',
    label: 'Nhân sự & Tiền lương',
    icon: <Briefcase size={20} />,
    children: [
      { id: 'staff', label: 'Danh sách Nhân sự', icon: <UserCog size={18} />, href: '/hr/staff' },
      { id: 'contracts', label: 'Hợp đồng Lao động', icon: <FileSignature size={18} />, href: '/hr/contracts' },
      { id: 'payroll', label: 'Bảng lương', icon: <DollarSign size={18} />, href: '/hr/payroll' },
    ],
  },
  {
    id: 'admin',
    label: 'Hành chính & Tài sản',
    icon: <FolderOpen size={20} />,
    children: [
      { id: 'projects', label: 'Công trình & Dự án', icon: <Building size={18} />, href: '/admin/projects' },
      { id: 'assets', label: 'Quản lý Tài sản', icon: <Landmark size={18} />, href: '/admin/assets' },
      { id: 'rental-contracts', label: 'Hợp đồng Cho thuê BDS', icon: <FileSignature size={18} />, href: '/admin/rental-contracts' },
    ],
  },
  {
    id: 'settings',
    label: 'Cài đặt Hệ thống',
    icon: <Settings size={20} />,
    children: [
      { id: 'users', label: 'Phân quyền (RBAC)', icon: <Shield size={18} />, href: '/settings/users' },
    ],
  },
];

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  cha_quan_ly: 'Cha Quản lý',
  cha_xu: 'Cha xứ',
  ke_toan: 'Kế toán VP',
  thu_ky: 'Thư ký GX',
};

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
            className={`w-full flex items-center justify-center p-3 rounded-xl transition-all duration-200
              ${isActive ? 'bg-white/20 text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
            {item.icon}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-56 ml-2">
          <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">{item.label}</div>
          <DropdownMenuSeparator />
          {item.children?.map((child) => (
            <DropdownMenuItem key={child.id} asChild>
              <Link href={child.href || '#'} className="flex items-center gap-2">
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
        className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200
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
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200
            ${isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
        >
          <div className="flex items-center gap-3">
            <span className={`transition-colors ${isActive ? 'text-white' : ''}`}>{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {item.badge && (
              <span className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded-full">{item.badge}</span>
            )}
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
        </button>
      ) : (
        <Link
          href={item.href || '#'}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
            ${isActive ? 'bg-white/20 text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
        >
          {item.icon}
          <span className="text-sm font-medium">{item.label}</span>
        </Link>
      )}

      {/* Submenu */}
      {hasChildren && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="ml-4 mt-1 pl-4 border-l border-gray-700 space-y-1">
            {item.children?.map((child) => {
              const isChildItemActive = child.href === pathname;
              return (
                <Link
                  key={child.id}
                  href={child.href || '#'}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
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
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-expand menu based on current path
  useEffect(() => {
    menuData.forEach((item) => {
      if (item.children?.some((c) => c.href === pathname)) {
        if (!expanded.includes(item.id)) {
          setExpanded((prev) => [...prev, item.id]);
        }
      }
    });
  }, [pathname]);

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
          ${sidebarOpen ? 'w-72' : 'w-20'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-gray-900
          transition-all duration-300 ease-in-out shadow-2xl`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Cross className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="font-bold text-white text-lg">GPBMT.ORG</h1>
                  <p className="text-xs text-white/60">Giáo phận Buôn Ma Thuột</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="m-auto p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white hidden lg:block"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        {sidebarOpen && (
          <div className="p-4">
            <div className="bg-gray-800 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-amber-400">
                  <AvatarFallback className="bg-amber-500 text-white font-semibold">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                  <p className="text-xs text-white/60 truncate">{roleLabels[user.role] || user.role}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                      <ChevronDown size={16} className="text-white/70" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <User size={16} className="mr-2" /> Hồ sơ cá nhân
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings size={16} className="mr-2" /> Cài đặt
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut size={16} className="mr-2" /> Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        {sidebarOpen && (
          <div className="px-4 pb-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/10 border-white/10 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/20"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-white/20">
          {menuData.map((item) => (
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
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>

            {/* Breadcrumb / Page Title */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Hệ thống Quản lý Giáo phận Buôn Ma Thuột
              </h2>
              <p className="text-sm text-gray-500 hidden sm:block">
                {new Date().toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* Search (Desktop) */}
            <div className="hidden md:block relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Tìm kiếm nhanh..." className="pl-9 w-64 bg-gray-50" />
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell size={20} className="text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-3 border-b">
                  <h3 className="font-semibold">Thông báo</h3>
                </div>
                <div className="p-4 text-center text-gray-500 text-sm">
                  Không có thông báo mới
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu (Desktop) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden lg:flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-900 text-white text-sm">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden xl:block">
                    <p className="text-sm font-medium text-gray-700">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{roleLabels[user.role]}</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2 border-b">
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <DropdownMenuItem>
                  <User size={16} className="mr-2" /> Hồ sơ cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings size={16} className="mr-2" /> Cài đặt tài khoản
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
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
