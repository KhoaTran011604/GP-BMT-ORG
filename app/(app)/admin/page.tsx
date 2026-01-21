'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hành chính & Tài sản</h1>
        <p className="text-gray-600">Quản lý E-Office, công trình, tài sản</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>E-Office (Đơn từ)</CardTitle>
            <CardDescription>Quản lý các đơn từ</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">Module này đang được phát triển</p>
            <p className="text-sm text-gray-500">Quản lý quy trình đơn từ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Công trình & Dự án</CardTitle>
            <CardDescription>Quản lý các công trình</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">Module này đang được phát triển</p>
            <p className="text-sm text-gray-500">Theo dõi tiến độ công trình</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quản lý Tài sản</CardTitle>
            <CardDescription>Danh sách tài sản</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">Module này đang được phát triển</p>
            <p className="text-sm text-gray-500">Đất, nhà, phương tiện, thiết bị</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hội đoàn</CardTitle>
            <CardDescription>Quản lý các hội đoàn</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">Module này đang được phát triển</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
