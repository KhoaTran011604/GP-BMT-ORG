'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function HRPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Nhân sự & Lương</h1>
          <p className="text-gray-600">Quản lý nhân viên và bảng lương</p>
        </div>
        <Button className="gap-2">
          <Plus size={20} />
          Thêm Nhân viên
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quản lý Nhân viên</CardTitle>
            <CardDescription>Danh sách nhân viên VP</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">Module này đang được phát triển</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bảng Lương</CardTitle>
            <CardDescription>Quản lý bảng lương tháng</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">Module này đang được phát triển</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
