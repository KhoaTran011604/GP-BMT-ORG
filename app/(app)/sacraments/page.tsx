'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const sacraments = [
  {
    id: 'baptism',
    title: 'Rua toi',
    description: 'So bo Bi tich Rua toi',
    icon: '💧',
    color: 'from-blue-500 to-cyan-500',
    stats: { total: 0, thisYear: 0 }
  },
  {
    id: 'confirmation',
    title: 'Them suc',
    description: 'So bo Bi tich Them suc',
    icon: '🔥',
    color: 'from-red-500 to-orange-500',
    stats: { total: 0, thisYear: 0 }
  },
  {
    id: 'marriage',
    title: 'Hon phoi',
    description: 'So bo Bi tich Hon phoi',
    icon: '💒',
    color: 'from-pink-500 to-rose-500',
    stats: { total: 0, thisYear: 0 }
  },
  {
    id: 'funeral',
    title: 'An tang',
    description: 'So bo Nghi thuc An tang',
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
          <h1 className="text-2xl font-bold">So bo Bi tich</h1>
          <p className="text-gray-600">Quan ly so bo cac Bi tich trong Giao phan</p>
        </div>
        <Button variant="outline">Xuat bao cao</Button>
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
                    <p className="text-xs text-gray-500">Tong so</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{s.stats.thisYear}</p>
                    <p className="text-xs text-gray-500">Nam nay</p>
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
          <CardTitle>Thao tac nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/sacraments/baptism/new">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <span className="text-2xl">💧</span>
                <span>Them Rua toi</span>
              </Button>
            </Link>
            <Link href="/sacraments/confirmation/new">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <span className="text-2xl">🔥</span>
                <span>Them Them suc</span>
              </Button>
            </Link>
            <Link href="/sacraments/marriage/new">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <span className="text-2xl">💒</span>
                <span>Them Hon phoi</span>
              </Button>
            </Link>
            <Link href="/sacraments/funeral/new">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <span className="text-2xl">🕊️</span>
                <span>Them An tang</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoat dong gan day</CardTitle>
          <CardDescription>Cac bi tich duoc ghi nhan gan day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-4">📖</p>
            <p>Chua co hoat dong nao gan day</p>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Huong dan</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Click vao tung loai Bi tich de xem danh sach chi tiet</li>
            <li>• Su dung chuc nang tim kiem de tra cuu thong tin nhanh chong</li>
            <li>• Moi ban ghi deu duoc luu voi so so va so thu tu de tien truy xuat</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
