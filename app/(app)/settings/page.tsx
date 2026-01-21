'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cài đặt Hệ thống</h1>
        <p className="text-gray-600">Quản lý cấu hình, quyền hạn, và nhật ký hệ thống</p>
      </div>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin Cá nhân</CardTitle>
          <CardDescription>Thông tin đăng nhập của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Tên đăng nhập</p>
              <p className="font-semibold">{user?.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vai trò</p>
              <p className="font-semibold">
                {user?.role === 'super_admin' && 'Super Admin'}
                {user?.role === 'cha_quan_ly' && 'Cha Quản lý'}
                {user?.role === 'cha_xu' && 'Cha xứ'}
                {user?.role === 'ke_toan' && 'Kế toán VP'}
                {user?.role === 'thu_ky' && 'Thư ký GX'}
              </p>
            </div>
            <Button variant="outline">Đổi mật khẩu</Button>
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Phân quyền (RBAC)</CardTitle>
          <CardDescription>Vai trò và quyền hạn người dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold">Vai trò</th>
                  <th className="text-left py-2 px-4 font-semibold">Dashboard</th>
                  <th className="text-left py-2 px-4 font-semibold">Giáo xứ</th>
                  <th className="text-left py-2 px-4 font-semibold">Tài chính</th>
                  <th className="text-left py-2 px-4 font-semibold">Báo cáo</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4 font-medium">Super Admin</td>
                  <td className="py-2 px-4">Full</td>
                  <td className="py-2 px-4">Full</td>
                  <td className="py-2 px-4">Full</td>
                  <td className="py-2 px-4">Full</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-medium">Cha Quản lý</td>
                  <td className="py-2 px-4">View</td>
                  <td className="py-2 px-4">View</td>
                  <td className="py-2 px-4">Full</td>
                  <td className="py-2 px-4">Full</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-medium">Cha xứ</td>
                  <td className="py-2 px-4">View</td>
                  <td className="py-2 px-4">Own</td>
                  <td className="py-2 px-4">Own</td>
                  <td className="py-2 px-4">Own</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-medium">Kế toán VP</td>
                  <td className="py-2 px-4">View</td>
                  <td className="py-2 px-4">View</td>
                  <td className="py-2 px-4">Edit</td>
                  <td className="py-2 px-4">View</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-medium">Thư ký GX</td>
                  <td className="py-2 px-4">View</td>
                  <td className="py-2 px-4">Own</td>
                  <td className="py-2 px-4">Create</td>
                  <td className="py-2 px-4">-</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Own = Chỉ dữ liệu của chính mình, Full = Toàn bộ, Edit = Chỉnh sửa, Create = Tạo mới, View = Xem
          </p>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin Hệ thống</CardTitle>
          <CardDescription>Cấu hình và phiên bản hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tên hệ thống</p>
                <p className="font-semibold">GPBMT - Hệ thống Quản lý Giáo phận</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phiên bản</p>
                <p className="font-semibold">1.0 MVP</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Framework</p>
                <p className="font-semibold">Next.js 16 + React 19 + TypeScript</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Database</p>
                <p className="font-semibold">MongoDB</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle>Nhật ký Hệ thống</CardTitle>
          <CardDescription>Ghi nhận tất cả hành động quan trọng</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Hệ thống sẽ ghi nhận tất cả các hành động: tạo, cập nhật, xóa, phê duyệt
          </p>
          <Button variant="outline">Xem Nhật ký</Button>
          <p className="text-xs text-gray-500 mt-4">Module này đang được phát triển</p>
        </CardContent>
      </Card>

      {/* Backup & Import */}
      <Card>
        <CardHeader>
          <CardTitle>Sao lưu & Nhập dữ liệu</CardTitle>
          <CardDescription>Quản lý dữ liệu lịch sử</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" className="w-full bg-transparent">
              Tải xuống Sao lưu
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Nhập dữ liệu từ Excel
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-4">Module này đang được phát triển</p>
        </CardContent>
      </Card>
    </div>
  );
}
