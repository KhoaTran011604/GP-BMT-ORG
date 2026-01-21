'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PeoplePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Giáo dân</h1>
          <p className="text-gray-600">Sổ gia đình công giáo và thông tin giáo dân</p>
        </div>
        <Button className="gap-2">
          <Plus size={20} />
          Thêm Gia đình
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sổ Gia đình Công giáo</CardTitle>
          <CardDescription>Danh sách gia đình và giáo dân</CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600 mb-4">Module này đang được phát triển</p>
          <p className="text-sm text-gray-500">
            Chức năng: Quản lý gia đình, thông tin giáo dân, mối quan hệ
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
