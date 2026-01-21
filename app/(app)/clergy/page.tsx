'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ClergyPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Linh mục</h1>
          <p className="text-gray-600">Quản lý linh mục đoàn và bí tích</p>
        </div>
        <Button className="gap-2">
          <Plus size={20} />
          Thêm Linh mục
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Linh mục đoàn</CardTitle>
          <CardDescription>Danh sách các Linh mục trong Giáo phận</CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600 mb-4">Module này đang được phát triển</p>
          <p className="text-sm text-gray-500">
            Chức năng: Quản lý linh mục, lịch sử bổ nhiệm, sổ bộ bí tích
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
