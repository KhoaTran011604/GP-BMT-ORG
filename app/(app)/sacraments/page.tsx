'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const sacraments = [
  {
    id: 'baptism',
    title: 'Rửa tội',
    description: 'Sổ bộ Bí tích Rửa tội',
    icon: '💧',
    color: 'from-blue-500 to-cyan-500',
    stats: { total: 0, thisYear: 0 }
  },
  {
    id: 'confirmation',
    title: 'Thêm sức',
    description: 'Sổ bộ Bí tích Thêm sức',
    icon: '🔥',
    color: 'from-red-500 to-orange-500',
    stats: { total: 0, thisYear: 0 }
  },
  {
    id: 'marriage',
    title: 'Hôn phối',
    description: 'Sổ bộ Bí tích Hôn phối',
    icon: '💒',
    color: 'from-pink-500 to-rose-500',
    stats: { total: 0, thisYear: 0 }
  },
  {
    id: 'funeral',
    title: 'Ăn táng',
    description: 'Sổ bộ Nghi thức Ăn táng',
    icon: '🕊️',
    color: 'from-gray-500 to-slate-500',
    stats: { total: 0, thisYear: 0 }
  },
];

export default function SacramentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sổ bộ Bí tích</h1>
          <p className="text-gray-600">Quản lý sổ bộ các Bí tích trong Giáo phận</p>
        </div>
        <Button variant="outline">Xuất báo cáo</Button>
      </div>

      {/* Sacrament Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sacraments.map((s) => (
          <Link key={s.id} href={`/sacraments/${s.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className={`bg-gradient-to-br ${s.color} text-white rounded-t-lg`}>
                <div className="text-4xl mb-2">{s.icon}</div>
                <CardTitle>{s.title}</CardTitle>
                <CardDescription className="text-white/80">{s.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{s.stats.total}</p>
                    <p className="text-xs text-gray-500">Tổng số</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{s.stats.thisYear}</p>
                    <p className="text-xs text-gray-500">Năm nay</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/sacraments/baptism/new">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <span className="text-2xl">💧</span>
                <span>Thêm Rửa tội</span>
              </Button>
            </Link>
            <Link href="/sacraments/confirmation/new">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <span className="text-2xl">🔥</span>
                <span>Thêm Thêm sức</span>
              </Button>
            </Link>
            <Link href="/sacraments/marriage/new">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <span className="text-2xl">💒</span>
                <span>Thêm Hôn phối</span>
              </Button>
            </Link>
            <Link href="/sacraments/funeral/new">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <span className="text-2xl">🕊️</span>
                <span>Thêm Ăn táng</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>Các bí tích được ghi nhận gần đây</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-4">📖</p>
            <p>Chưa có hoạt động nào gần đây</p>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Hướng dẫn</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Click vào từng loại Bí tích để xem danh sách chi tiết</li>
            <li>• Sử dụng chức năng tìm kiếm để tra cứu thông tin nhanh chóng</li>
            <li>• Mỗi bản ghi đều được lưu với số sổ và số thứ tự để tiện truy xuất</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
