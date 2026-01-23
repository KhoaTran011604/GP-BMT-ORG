'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCompactCurrency } from '@/lib/utils';

interface Fund {
  _id: string;
  fundCode: string;
  fundName: string;
  group: 'A' | 'B' | 'C';
  recipient: string;
  cycle: string;
  description?: string;
  totalCollected?: number;
  status: string;
}

const fundGroups = {
  A: {
    title: 'Quỹ chuyển HĐGMVN',
    description: 'Các quỹ được chuyển về Hội đồng Giám mục Việt Nam',
    color: 'blue',
    funds: [
      { code: 'FUND_01', name: 'Quỹ Liên hiệp Truyền giáo', cycle: 'Năm' },
      { code: 'FUND_02', name: 'Quỹ Thiếu nhi Truyền giáo', cycle: 'Năm' },
      { code: 'FUND_03', name: 'Quỹ Lễ Thánh Phêrô và Phaolô', cycle: 'Năm' },
      { code: 'FUND_04', name: 'Quỹ Truyền giáo', cycle: 'Năm' },
    ]
  },
  B: {
    title: 'Quỹ chuyển TGM BMT',
    description: 'Các quỹ được chuyển về Tòa Giám mục Buôn Ma Thuột',
    color: 'purple',
    funds: [
      { code: 'FUND_05', name: 'Quỹ Giúp Đại Chủng viện', cycle: 'Năm' },
      { code: 'FUND_06', name: 'Quỹ Phòng thu Tòa Giám mục', cycle: 'Tháng' },
      { code: 'FUND_07', name: 'Quỹ Tôn chân Chúa', cycle: 'Năm' },
    ]
  },
  C: {
    title: 'Quỹ nội bộ & Nguồn thu',
    description: 'Các quỹ nội bộ và nguồn thu khác',
    color: 'green',
    funds: [
      { code: 'FUND_08', name: 'Quỹ giúp Cha hưu', cycle: 'Năm' },
      { code: 'FUND_09', name: 'Tiền xin lễ (Mass Stipends)', cycle: 'Tháng' },
      { code: 'FUND_10', name: 'Tiền rổ & Quyên góp', cycle: 'Tháng' },
      { code: 'FUND_11', name: 'Ân nhân & Tài trợ', cycle: 'Tùy thời' },
    ]
  }
};

export default function FundsPage() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('A');

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    try {
      const res = await fetch('/api/funds');
      if (res.ok) {
        const data = await res.json();
        setFunds(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching funds:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Danh mục Quỹ</h1>
          <p className="text-gray-600">Quản lý 11 loại quỹ trong Giáo phận</p>
        </div>
        <Button variant="outline">Xuất báo cáo</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(fundGroups).map(([key, group]) => (
          <Card key={key} className={`border-2 ${getColorClass(group.color)}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{group.title}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{group.funds.length}</span>
                <span className="text-sm">loại quỹ</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for each group */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="A">Nhóm A - HĐGMVN</TabsTrigger>
          <TabsTrigger value="B">Nhóm B - TGM BMT</TabsTrigger>
          <TabsTrigger value="C">Nhóm C - Nội bộ</TabsTrigger>
        </TabsList>

        {Object.entries(fundGroups).map(([key, group]) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardHeader>
                <CardTitle>{group.title}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Mã quỹ</TableHead>
                      <TableHead>Tên quỹ</TableHead>
                      <TableHead>Chu kỳ</TableHead>
                      <TableHead className="text-right">Tổng thu (năm nay)</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.funds.map((fund, index) => {
                      const dbFund = funds.find(f => f.fundCode === fund.code);
                      return (
                        <TableRow key={fund.code}>
                          <TableCell className="font-mono font-medium">{fund.code}</TableCell>
                          <TableCell>{fund.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{fund.cycle}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCompactCurrency(dbFund?.totalCollected || 0)}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">
                              Hoạt động
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">Chi tiết</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Info Section */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-amber-800 mb-2">Lưu ý quan trọng</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Các quỹ nhóm A được chuyển về HĐGMVN theo định kỳ hàng năm</li>
            <li>• Quỹ Phòng thu TGM (FUND_06) được thu hàng tháng</li>
            <li>• Mọi giao dịch cần được xác thực bởi Cha Quản lý trước khi ghi nhận</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
