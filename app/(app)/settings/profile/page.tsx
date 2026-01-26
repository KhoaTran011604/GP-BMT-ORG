'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Building, Calendar, Shield, Save } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  cha_quan_ly: 'Cha Quản lý',
  cha_xu: 'Cha xứ',
  ke_toan: 'Kế toán VP',
  thu_ky: 'Thư ký GX',
};

const roleColors: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-800',
  cha_quan_ly: 'bg-purple-100 text-purple-800',
  cha_xu: 'bg-blue-100 text-blue-800',
  ke_toan: 'bg-green-100 text-green-800',
  thu_ky: 'bg-orange-100 text-orange-800',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: '',
    address: '',
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Cập nhật thông tin thành công');
      } else {
        const result = await res.json();
        alert(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="text-blue-600" />
          Hồ sơ cá nhân
        </h1>
        <p className="text-gray-600">Xem và quản lý thông tin cá nhân của bạn</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 border-4 border-blue-100">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <Badge className={`mt-4 ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
                <Shield size={12} className="mr-1" />
                {roleLabels[user.role] || user.role}
              </Badge>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{user.fullName}</h2>
                <p className="text-gray-500 flex items-center gap-2">
                  <Mail size={16} />
                  {user.email}
                </p>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Building size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Đơn vị</p>
                    <p className="font-medium">TGM Buôn Ma Thuột</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Ngày tham gia</p>
                    <p className="font-medium">
                      {new Date().toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin liên hệ</CardTitle>
          <CardDescription>Cập nhật thông tin liên hệ của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Nhập địa chỉ"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                <Save size={16} className="mr-2" />
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
          <CardDescription>Thông tin về quyền hạn và vai trò trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="text-blue-600" size={24} />
                <div>
                  <p className="font-medium">Vai trò</p>
                  <p className="text-sm text-gray-500">Quyền hạn trong hệ thống</p>
                </div>
              </div>
              <Badge className={roleColors[user.role] || 'bg-gray-100 text-gray-800'}>
                {roleLabels[user.role] || user.role}
              </Badge>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Lưu ý:</strong> Để thay đổi vai trò hoặc quyền hạn, vui lòng liên hệ Super Admin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
