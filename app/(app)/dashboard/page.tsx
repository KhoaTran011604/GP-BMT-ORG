'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const stats = [
  { label: 'Giáo xứ', value: '0', icon: '⛪', href: '/parish' },
  { label: 'Giáo dân', value: '0', icon: '👥', href: '/people' },
  { label: 'Giao dịch tài chính', value: '0', icon: '💰', href: '/finance' },
  { label: 'Linh mục', value: '0', icon: '👨‍🎓', href: '/clergy' },
];

const recentModules = [
  {
    title: 'Giáo xứ & Giáo họ',
    description: 'Quản lý danh sách giáo xứ và các giáo họ trực thuộc',
    icon: '⛪',
    href: '/parish',
    status: 'Sẵn sàng',
  },
  {
    title: 'Tài chính',
    description: 'Quản lý các quỹ và giao dịch tài chính',
    icon: '💰',
    href: '/finance',
    status: 'Sẵn sàng',
  },
  {
    title: 'Linh mục',
    description: 'Quản lý linh mục đoàn và bí tích',
    icon: '👨‍🎓',
    href: '/clergy',
    status: 'Sẵn sàng',
  },
  {
    title: 'Giáo dân',
    description: 'Quản lý gia đình và thông tin giáo dân',
    icon: '👥',
    href: '/people',
    status: 'Sẵn sàng',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gray-900 text-white rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">
          Chào mừng, {user?.fullName}!
        </h1>
        <p className="text-gray-200">
          Quản lý toàn diện Giáo phận Buôn Ma Thuột từ một nơi duy nhất
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{stat.icon}</span>
                  <span className="text-2xl font-bold text-blue-600">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Modules */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Các Module Chính</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentModules.map((module) => (
            <Link key={module.href} href={module.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-3xl">{module.icon}</span>
                        {module.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-gray-600">Trạng thái:</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      {module.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Hành động nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/parish" className="bg-white p-4 rounded hover:shadow transition-shadow">
            <p className="font-semibold text-blue-600">Thêm Giáo xứ mới</p>
            <p className="text-sm text-gray-600">Đăng ký giáo xứ mới vào hệ thống</p>
          </Link>
          <Link href="/people" className="bg-white p-4 rounded hover:shadow transition-shadow">
            <p className="font-semibold text-blue-600">Quản lý Giáo dân</p>
            <p className="text-sm text-gray-600">Cập nhật thông tin gia đình và giáo dân</p>
          </Link>
          <Link href="/finance" className="bg-white p-4 rounded hover:shadow transition-shadow">
            <p className="font-semibold text-blue-600">Nhập Giao dịch Tài chính</p>
            <p className="text-sm text-gray-600">Ghi nhận các giao dịch từ các quỹ</p>
          </Link>
        </div>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Phiên bản hệ thống</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">1.0 MVP</p>
            <p className="text-sm text-gray-600 mt-1">Giai đoạn triển khai đầu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vai trò của bạn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-blue-600 capitalize">
              {user?.role === 'super_admin' && 'Super Admin'}
              {user?.role === 'cha_quan_ly' && 'Cha Quản lý'}
              {user?.role === 'cha_xu' && 'Cha xứ'}
              {user?.role === 'ke_toan' && 'Kế toán VP'}
              {user?.role === 'thu_ky' && 'Thư ký GX'}
            </p>
            <p className="text-sm text-gray-600 mt-1">Quyền hạn: Quản lý cơ bản</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trợ giúp</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Cần hỗ trợ? Liên hệ với bộ phận IT tại Tòa Giám mục
            </p>
            <p className="text-sm font-semibold text-blue-600 mt-2">it@gpbmt.org</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
