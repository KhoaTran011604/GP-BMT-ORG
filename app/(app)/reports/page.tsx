'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Báo cáo & Thống kê</h1>
        <p className="text-gray-600">Báo cáo tài chính, mục vụ, và nhân sự</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Finance Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Báo cáo Tài chính</CardTitle>
            <CardDescription>Báo cáo thu chi các quỹ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Download size={18} />
                Tổng hợp thu các Quỹ
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Download size={18} />
                Chi tiết theo Giáo xứ
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Download size={18} />
                Đối soát Giao dịch
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4">Module này đang được phát triển</p>
          </CardContent>
        </Card>

        {/* Pastoral Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Báo cáo Mục vụ</CardTitle>
            <CardDescription>Thống kê bí tích, linh mục</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Download size={18} />
                Thống kê Bí tích
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Download size={18} />
                Danh sách Linh mục
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4">Module này đang được phát triển</p>
          </CardContent>
        </Card>

        {/* Parish Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Báo cáo Giáo xứ</CardTitle>
            <CardDescription>Thống kê giáo dân, giáo xứ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Download size={18} />
                Tổng quan Giáo xứ
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Download size={18} />
                Biến động Giáo dân
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4">Module này đang được phát triển</p>
          </CardContent>
        </Card>

        {/* HR Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Báo cáo Nhân sự</CardTitle>
            <CardDescription>Bảng lương, nhân viên</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Download size={18} />
                Bảng lương tổng hợp
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4">Module này đang được phát triển</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
