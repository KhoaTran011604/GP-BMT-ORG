'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Church, Users, Wallet, GraduationCap, ArrowRight, Plus, Phone, Mail, Info, Shield } from 'lucide-react';

const stats = [
  { label: 'Giáo xứ', value: '0', icon: Church, href: '/parish', color: 'text-purple-600 bg-purple-100' },
  { label: 'Giáo dân', value: '0', icon: Users, href: '/people', color: 'text-blue-600 bg-blue-100' },
  { label: 'Giao dịch', value: '0', icon: Wallet, href: '/finance', color: 'text-green-600 bg-green-100' },
  { label: 'Linh mục', value: '0', icon: GraduationCap, href: '/clergy', color: 'text-orange-600 bg-orange-100' },
];

const recentModules = [
  {
    title: 'Giáo xứ & Giáo họ',
    description: 'Quản lý danh sách giáo xứ và các giáo họ trực thuộc',
    icon: Church,
    href: '/parish',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Tài chính',
    description: 'Quản lý các quỹ và giao dịch tài chính',
    icon: Wallet,
    href: '/finance',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Linh mục',
    description: 'Quản lý linh mục đoàn và bí tích',
    icon: GraduationCap,
    href: '/clergy',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Giáo dân',
    description: 'Quản lý gia đình và thông tin giáo dân',
    icon: Users,
    href: '/people',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
];

const quickActions = [
  {
    title: 'Thêm Giáo xứ mới',
    description: 'Đăng ký giáo xứ mới vào hệ thống',
    href: '/parish',
    icon: Plus,
  },
  {
    title: 'Quản lý Giáo dân',
    description: 'Cập nhật thông tin gia đình và giáo dân',
    href: '/people',
    icon: Users,
  },
  {
    title: 'Nhập Giao dịch',
    description: 'Ghi nhận các giao dịch từ các quỹ',
    href: '/finance',
    icon: Wallet,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const getRoleDisplay = (role?: string) => {
    const roles: Record<string, string> = {
      super_admin: 'Super Admin',
      cha_quan_ly: 'Cha Quản lý',
      cha_xu: 'Cha xứ',
      ke_toan: 'Kế toán VP',
      thu_ky: 'Thư ký GX',
    };
    return roles[role || ''] || role;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section - Larger text for elderly users */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl p-8 shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Chào mừng, {user?.fullName}!
        </h1>
        <p className="text-lg md:text-xl text-blue-100">
          Quản lý toàn diện Giáo phận Buôn Ma Thuột từ một nơi duy nhất
        </p>
      </div>

      {/* Stats Grid - Larger touch targets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Link key={stat.href} href={stat.href}>
              <Card className="hover:shadow-xl transition-all cursor-pointer h-full border-2 hover:border-blue-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                      <IconComponent size={28} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-base font-medium text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main Modules - Clear visual hierarchy */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">Các Module Chính</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Link key={module.href} href={module.href}>
                <Card className={`hover:shadow-xl transition-all cursor-pointer h-full border-2 hover:border-blue-300 ${module.bgColor}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-xl bg-white shadow-sm ${module.color}`}>
                        <IconComponent size={32} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
                          {module.title}
                        </CardTitle>
                        <CardDescription className="text-base mt-1 text-gray-600">
                          {module.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="px-4 py-2 bg-green-100 text-green-800 text-base font-semibold rounded-full">
                        Sẵn sàng
                      </span>
                      <Button variant="ghost" className="text-blue-600 font-semibold text-base">
                        Truy cập
                        <ArrowRight size={20} className="ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions - Larger buttons */}
      <div className="bg-gray-50 rounded-xl p-6 md:p-8 border-2 border-gray-200">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">Hành động nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer h-full">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                      <IconComponent size={24} />
                    </div>
                    <p className="text-lg font-bold text-blue-700">{action.title}</p>
                  </div>
                  <p className="text-base text-gray-600">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* System Info - Clearer layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2 text-gray-900">
              <Info size={22} className="text-blue-600" />
              Phiên bản hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">1.0 MVP</p>
            <p className="text-base text-gray-600 mt-2">Giai đoạn triển khai đầu</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2 text-gray-900">
              <Shield size={22} className="text-green-600" />
              Vai trò của bạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl md:text-2xl font-bold text-green-600">
              {getRoleDisplay(user?.role)}
            </p>
            <p className="text-base text-gray-600 mt-2">Quyền hạn: Quản lý cơ bản</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2 text-gray-900">
              <Phone size={22} className="text-purple-600" />
              Trợ giúp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-gray-600">
              Cần hỗ trợ? Liên hệ bộ phận IT
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Mail size={18} className="text-blue-600" />
              <p className="text-lg font-bold text-blue-600">it@gpbmt.org</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
