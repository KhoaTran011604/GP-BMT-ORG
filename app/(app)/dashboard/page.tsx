'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Church,
  Users,
  Wallet,
  Building2,
  TrendingUp,
  PieChart,
  BarChart3,
  Layers,
} from 'lucide-react';
import {
  FundVsTargetChart,
  MonthlyTrendChart,
  ExpenseCategoryChart,
  TopParishChart,
  ParishByDeaneryChart,
  ParishionerByParishChart,
  AssetByTypeChart,
  ParishionerGrowthChart,
  AssetValueByParishChart,
  SummaryCards,
} from '@/components/dashboard/DashboardCharts';
import { formatCompactCurrency } from '@/lib/utils';

type TabType = 'tai_chinh' | 'giao_xu' | 'tong_hop';

// Mock data - replace with API calls later
const mockFinancialData = {
  fundVsTarget: [
    { fundName: 'Liên hiệp TG', actual: 180000000, target: 200000000 },
    { fundName: 'Thiếu nhi TG', actual: 120000000, target: 150000000 },
    { fundName: 'Lễ', actual: 145000000, target: 130000000 },
    { fundName: 'Phêrô-Phaolô', actual: 95000000, target: 100000000 },
    { fundName: 'Truyền giáo', actual: 75000000, target: 80000000 },
    { fundName: 'Đại Chủng viện', actual: 210000000, target: 200000000 },
    { fundName: 'Phòng thu TGM', actual: 185000000, target: 180000000 },
    { fundName: 'Tôn chân Chúa', actual: 110000000, target: 120000000 },
  ],
  monthlyTrend: [
    { month: 'T1', income: 450000000, expense: 320000000 },
    { month: 'T2', income: 380000000, expense: 290000000 },
    { month: 'T3', income: 520000000, expense: 380000000 },
    { month: 'T4', income: 480000000, expense: 350000000 },
    { month: 'T5', income: 550000000, expense: 400000000 },
    { month: 'T6', income: 620000000, expense: 450000000 },
    { month: 'T7', income: 580000000, expense: 420000000 },
    { month: 'T8', income: 490000000, expense: 380000000 },
    { month: 'T9', income: 530000000, expense: 390000000 },
    { month: 'T10', income: 610000000, expense: 440000000 },
    { month: 'T11', income: 680000000, expense: 480000000 },
    { month: 'T12', income: 750000000, expense: 520000000 },
  ],
  expenseCategories: [
    { name: 'Mục vụ', value: 350000000, percentage: 35 },
    { name: 'Hành chính', value: 250000000, percentage: 25 },
    { name: 'Nhân sự', value: 200000000, percentage: 20 },
    { name: 'Từ thiện', value: 120000000, percentage: 12 },
    { name: 'Khác', value: 80000000, percentage: 8 },
  ],
  topParishes: [
    { parishName: 'GX Thánh Tâm', amount: 95000000 },
    { parishName: 'GX Phú Long', amount: 82000000 },
    { parishName: 'GX Tam Tòa', amount: 68000000 },
    { parishName: 'GX Hòa Thuận', amount: 55000000 },
    { parishName: 'GX Vinh Hòa', amount: 45000000 },
  ],
};

const mockParishData = {
  byDeanery: [
    { deaneryName: 'GH BMT', count: 12 },
    { deaneryName: 'GH Gia Nghĩa', count: 8 },
    { deaneryName: 'GH Đắk Mil', count: 6 },
    { deaneryName: 'GH Phước An', count: 9 },
    { deaneryName: 'GH Ea Kar', count: 7 },
  ],
  parishionersByParish: [
    { parishName: 'GX Chính Tòa', count: 5200 },
    { parishName: 'GX Thánh Tâm', count: 4800 },
    { parishName: 'GX Phú Long', count: 4200 },
    { parishName: 'GX Vinh Sơn', count: 3900 },
    { parishName: 'GX Hòa Thuận', count: 3600 },
    { parishName: 'GX Tam Tòa', count: 3200 },
    { parishName: 'GX Ea Kar', count: 2900 },
    { parishName: 'GX Đức An', count: 2600 },
    { parishName: 'GX Kim Châu', count: 2300 },
    { parishName: 'GX Vinh Hòa', count: 2100 },
  ],
  growth: [
    { year: '2020', count: 180000 },
    { year: '2021', count: 185000 },
    { year: '2022', count: 192000 },
    { year: '2023', count: 198000 },
    { year: '2024', count: 205000 },
    { year: '2025', count: 212000 },
  ],
};

const mockAssetData = {
  byType: [
    { type: 'Đất đai', count: 45, value: 150000000000 },
    { type: 'Nhà cửa', count: 32, value: 80000000000 },
    { type: 'Phương tiện', count: 18, value: 5000000000 },
    { type: 'Thiết bị', count: 156, value: 3000000000 },
  ],
  byParish: [
    { parishName: 'TGM BMT', value: 85000000000 },
    { parishName: 'GX Chính Tòa', value: 45000000000 },
    { parishName: 'GX Thánh Tâm', value: 32000000000 },
    { parishName: 'GX Phú Long', value: 28000000000 },
    { parishName: 'GX Vinh Sơn', value: 22000000000 },
  ],
};

const mockSummaryStats = {
  totalParishes: 42,
  totalParishioners: 212000,
  totalIncome: 6640000000,
  totalExpense: 4820000000,
  totalAssets: 251,
  totalAssetValue: 238000000000,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('tai_chinh');
  const [loading, setLoading] = useState(true);

  // Stats counts
  const [stats, setStats] = useState({
    parishes: 0,
    parishioners: 0,
    transactions: 0,
    assets: 0,
  });

  useEffect(() => {
    // Fetch real stats from API
    const fetchStats = async () => {
      try {
        const [parishesRes, transactionsRes, assetsRes] = await Promise.all([
          fetch('/api/parishes'),
          fetch('/api/incomes'),
          fetch('/api/assets'),
        ]);

        if (parishesRes.ok) {
          const data = await parishesRes.json();
          setStats(prev => ({ ...prev, parishes: data.data?.length || 0 }));
        }

        if (transactionsRes.ok) {
          const data = await transactionsRes.json();
          setStats(prev => ({ ...prev, transactions: data.data?.length || 0 }));
        }

        if (assetsRes.ok) {
          const data = await assetsRes.json();
          setStats(prev => ({ ...prev, assets: Array.isArray(data) ? data.length : 0 }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const tabs = [
    { key: 'tai_chinh' as const, label: 'Tài chính', icon: Wallet, count: 4, color: 'bg-yellow-500' },
    { key: 'giao_xu' as const, label: 'Giáo xứ', icon: Building2, count: 4, color: 'bg-orange-500' },
    { key: 'tong_hop' as const, label: 'Tổng hợp', icon: Layers, count: null, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Chào mừng, {user?.fullName}!
        </h1>
        <p className="text-base md:text-lg text-blue-100">
          Dashboard tổng quan Giáo phận Buôn Ma Thuột
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <Church size={28} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.parishes}</p>
                <p className="text-base text-gray-600">Giáo xứ</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <Users size={28} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.parishioners.toLocaleString()}</p>
                <p className="text-base text-gray-600">Giáo dân</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <Wallet size={28} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.transactions}</p>
                <p className="text-base text-gray-600">Giao dịch</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                <Building2 size={28} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.assets}</p>
                <p className="text-base text-gray-600">Tài sản</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <Button
              key={tab.key}
              variant={isActive ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.key)}
              className={`h-12 px-6 text-base font-medium ${
                isActive ? `${tab.color} hover:opacity-90` : ''
              }`}
            >
              <Icon size={20} className="mr-2" />
              {tab.label}
              {tab.count !== null && (
                <Badge variant="secondary" className="ml-2 bg-white/20">
                  {tab.count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'tai_chinh' && (
        <div className="space-y-6">
          {/* Row 1: 2 charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FundVsTargetChart data={mockFinancialData.fundVsTarget} />
            <MonthlyTrendChart data={mockFinancialData.monthlyTrend} />
          </div>

          {/* Row 2: 2 charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpenseCategoryChart data={mockFinancialData.expenseCategories} />
            <TopParishChart data={mockFinancialData.topParishes} />
          </div>
        </div>
      )}

      {activeTab === 'giao_xu' && (
        <div className="space-y-6">
          {/* Row 1: 2 charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ParishByDeaneryChart data={mockParishData.byDeanery} />
            <ParishionerByParishChart data={mockParishData.parishionersByParish} />
          </div>

          {/* Row 2: Assets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AssetByTypeChart data={mockAssetData.byType} />
            <AssetValueByParishChart data={mockAssetData.byParish} />
          </div>
        </div>
      )}

      {activeTab === 'tong_hop' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <SummaryCards stats={mockSummaryStats} />

          {/* Key Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyTrendChart data={mockFinancialData.monthlyTrend} />
            <ParishionerGrowthChart data={mockParishData.growth} />
          </div>

          {/* More summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="text-green-600" size={24} />
                  Cân đối Thu Chi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tổng Thu</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCompactCurrency(mockSummaryStats.totalIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tổng Chi</span>
                    <span className="text-xl font-bold text-red-600">
                      {formatCompactCurrency(mockSummaryStats.totalExpense)}
                    </span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-gray-900 font-medium">Dư</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCompactCurrency(mockSummaryStats.totalIncome - mockSummaryStats.totalExpense)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="text-purple-600" size={24} />
                  Top Quỹ hoạt động
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockFinancialData.fundVsTarget.slice(0, 4).map((fund, i) => (
                    <div key={fund.fundName} className="flex justify-between items-center">
                      <span className="text-gray-600">{i + 1}. {fund.fundName}</span>
                      <span className="font-semibold">{formatCompactCurrency(fund.actual)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="text-orange-600" size={24} />
                  Phân bố Tài sản
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAssetData.byType.map((asset) => (
                    <div key={asset.type} className="flex justify-between items-center">
                      <span className="text-gray-600">{asset.type}</span>
                      <span className="font-semibold">{asset.count} tài sản</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
