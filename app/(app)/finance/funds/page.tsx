'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCompactCurrency } from '@/lib/utils';
import { ArrowLeft, Building2, Church, Wallet } from 'lucide-react';

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
    icon: Building2,
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
    icon: Church,
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
    icon: Wallet,
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
  const [selectedGroup, setSelectedGroup] = useState<'A' | 'B' | 'C' | null>('A');

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

  const getColorClasses = (color: string, isSelected: boolean) => {
    const base = {
      blue: {
        card: isSelected ? 'bg-blue-600 text-white border-blue-700' : 'bg-blue-50 hover:bg-blue-100 border-blue-200 cursor-pointer',
        icon: isSelected ? 'text-blue-100' : 'text-blue-600',
        badge: 'bg-blue-100 text-blue-800',
      },
      purple: {
        card: isSelected ? 'bg-purple-600 text-white border-purple-700' : 'bg-purple-50 hover:bg-purple-100 border-purple-200 cursor-pointer',
        icon: isSelected ? 'text-purple-100' : 'text-purple-600',
        badge: 'bg-purple-100 text-purple-800',
      },
      green: {
        card: isSelected ? 'bg-green-600 text-white border-green-700' : 'bg-green-50 hover:bg-green-100 border-green-200 cursor-pointer',
        icon: isSelected ? 'text-green-100' : 'text-green-600',
        badge: 'bg-green-100 text-green-800',
      },
    };
    return base[color as keyof typeof base] || base.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const selectedGroupData = selectedGroup ? fundGroups[selectedGroup] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Danh mục Quỹ</h1>
          <p className="text-gray-600">Quản lý 11 loại quỹ trong Giáo phận</p>
        </div>
      </div>

      {/* Fund Group Cards - Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.entries(fundGroups) as [keyof typeof fundGroups, typeof fundGroups.A][]).map(([key, group]) => {
          const isSelected = selectedGroup === key;
          const colors = getColorClasses(group.color, isSelected);
          const Icon = group.icon;

          return (
            <Card
              key={key}
              className={`border-2 transition-all duration-200 ${colors.card}`}
              onClick={() => setSelectedGroup(isSelected ? null : key)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-white'}`}>
                    <Icon className={colors.icon} size={24} />
                  </div>
                  <div>
                    <CardTitle className={`text-lg ${isSelected ? 'text-white' : ''}`}>
                      {group.title}
                    </CardTitle>
                    <CardDescription className={isSelected ? 'text-white/80' : ''}>
                      {group.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-3xl font-bold ${isSelected ? 'text-white' : ''}`}>
                    {group.funds.length}
                  </span>
                  <span className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    loại quỹ
                  </span>
                </div>
                {isSelected && (
                  <p className="text-sm text-white/70 mt-2">
                    Bấm để đóng chi tiết
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Group Detail */}
      {selectedGroupData && selectedGroup && (
        <Card className="animate-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedGroup(null)}
                  className="mr-2"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Quay lại
                </Button>
                <div>
                  <CardTitle>{selectedGroupData.title}</CardTitle>
                  <CardDescription>{selectedGroupData.description}</CardDescription>
                </div>
              </div>
            </div>
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
                {selectedGroupData.funds.map((fund) => {
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
      )}

      {/* Info Section - Only show when no group selected */}
      {!selectedGroup && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-amber-800 mb-2">Lưu ý quan trọng</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Các quỹ nhóm A được chuyển về HĐGMVN theo định kỳ hàng năm</li>
              <li>• Quỹ Phòng thu TGM (FUND_06) được thu hàng tháng</li>
              <li>• Mọi giao dịch cần được xác thực bởi Cha Quản lý trước khi ghi nhận</li>
              <li>• Bấm vào một nhóm quỹ để xem chi tiết các quỹ trong nhóm</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
