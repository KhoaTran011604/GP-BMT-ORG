'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Loader2,
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

const FUND_TARGET = 1000000000; // 1 tỷ VND

const assetTypeLabels: Record<string, string> = {
  land: 'Đất đai',
  building: 'Nhà cửa',
  vehicle: 'Phương tiện',
  equipment: 'Thiết bị',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('tai_chinh');
  const [loading, setLoading] = useState(true);

  // Raw data from APIs
  const [parishes, setParishes] = useState<any[]>([]);
  const [funds, setFunds] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);

  // Stats counts
  const [stats, setStats] = useState({
    parishes: 0,
    parishioners: 0,
    transactions: 0,
    assets: 0,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        parishesRes,
        fundsRes,
        incomesRes,
        expensesRes,
        assetsRes,
        categoriesRes,
      ] = await Promise.all([
        fetch('/api/parishes'),
        fetch('/api/funds'),
        fetch('/api/incomes'),
        fetch('/api/expenses'),
        fetch('/api/assets'),
        fetch('/api/expense-categories'),
      ]);

      if (parishesRes.ok) {
        const data = await parishesRes.json();
        const parishList = data.data || [];
        setParishes(parishList);
        setStats(prev => ({ ...prev, parishes: parishList.length }));
      }

      if (fundsRes.ok) {
        const data = await fundsRes.json();
        setFunds(data.data || []);
      }

      if (incomesRes.ok) {
        const data = await incomesRes.json();
        const incomeList = data.data || [];
        setIncomes(incomeList);
        setStats(prev => ({ ...prev, transactions: prev.transactions + incomeList.length }));
      }

      if (expensesRes.ok) {
        const data = await expensesRes.json();
        const expenseList = data.data || [];
        setExpenses(expenseList);
        setStats(prev => ({ ...prev, transactions: prev.transactions + expenseList.length }));
      }

      if (assetsRes.ok) {
        const data = await assetsRes.json();
        const assetList = Array.isArray(data) ? data : (data.data || []);
        setAssets(assetList);
        setStats(prev => ({ ...prev, assets: assetList.length }));
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setExpenseCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const financialData = useMemo(() => {
    // Fund vs Target - group incomes by fund
    const fundIncomes: Record<string, number> = {};
    incomes.forEach((income: any) => {
      if (income.status === 'approved' && income.fundId) {
        const fundId = income.fundId._id || income.fundId;
        fundIncomes[fundId] = (fundIncomes[fundId] || 0) + (income.amount || 0);
      }
    });

    // Pass all funds with category info - chart component handles filtering and top 5
    const fundVsTarget = funds.map((fund: any) => ({
      fundName: fund.fundName,
      actual: fundIncomes[fund._id] || 0,
      target: FUND_TARGET,
      category: fund.category as 'A' | 'B' | 'C' | undefined,
    }));

    // Monthly trend - group by month
    const currentYear = new Date().getFullYear();
    const monthlyData: Record<string, { income: number; expense: number }> = {};

    for (let i = 1; i <= 12; i++) {
      monthlyData[`T${i}`] = { income: 0, expense: 0 };
    }

    incomes.forEach((income: any) => {
      if (income.status === 'approved') {
        const date = new Date(income.incomeDate);
        if (date.getFullYear() === currentYear) {
          const month = `T${date.getMonth() + 1}`;
          monthlyData[month].income += income.amount || 0;
        }
      }
    });

    expenses.forEach((expense: any) => {
      if (expense.status === 'approved') {
        const date = new Date(expense.expenseDate);
        if (date.getFullYear() === currentYear) {
          const month = `T${date.getMonth() + 1}`;
          monthlyData[month].expense += expense.amount || 0;
        }
      }
    });

    const monthlyTrend = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
    }));

    // Expense by category
    const categoryExpenses: Record<string, number> = {};
    expenses.forEach((expense: any) => {
      if (expense.status === 'approved' && expense.categoryId) {
        const catId = expense.categoryId._id || expense.categoryId;
        categoryExpenses[catId] = (categoryExpenses[catId] || 0) + (expense.amount || 0);
      }
    });

    const totalExpense = Object.values(categoryExpenses).reduce((a, b) => a + b, 0);
    const expenseCategoriesData = expenseCategories
      .map((cat: any) => ({
        name: cat.categoryName,
        value: categoryExpenses[cat._id] || 0,
        percentage: totalExpense > 0 ? Math.round(((categoryExpenses[cat._id] || 0) / totalExpense) * 100) : 0,
      }))
      .filter((cat: any) => cat.value > 0)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 5);

    // Top parishes by contribution
    const parishIncomes: Record<string, { name: string; amount: number }> = {};
    incomes.forEach((income: any) => {
      if (income.status === 'approved' && income.parishId) {
        const parishId = income.parishId._id || income.parishId;
        const parishName = income.parishId?.parishName ||
          parishes.find((p: any) => p._id === parishId)?.parishName ||
          'Không xác định';

        if (!parishIncomes[parishId]) {
          parishIncomes[parishId] = { name: parishName, amount: 0 };
        }
        parishIncomes[parishId].amount += income.amount || 0;
      }
    });

    const topParishes = Object.values(parishIncomes)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(p => ({ parishName: p.name, amount: p.amount }));

    // Calculate totals
    const totalIncome = incomes
      .filter((i: any) => i.status === 'approved')
      .reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

    const totalExpenseAmount = expenses
      .filter((e: any) => e.status === 'approved')
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

    return {
      fundVsTarget,
      monthlyTrend,
      expenseCategories: expenseCategoriesData,
      topParishes,
      totalIncome,
      totalExpense: totalExpenseAmount,
    };
  }, [incomes, expenses, funds, expenseCategories, parishes]);

  // Process parish data
  const parishData = useMemo(() => {
    // Group by deanery (giáo hạt) - using parishCode prefix as deanery indicator
    const deaneryMap: Record<string, number> = {};
    parishes.forEach((parish: any) => {
      // Use first 2 characters of parishCode as deanery or default
      const deanery = parish.deanery || 'Khác';
      deaneryMap[deanery] = (deaneryMap[deanery] || 0) + 1;
    });

    const byDeanery = Object.entries(deaneryMap)
      .map(([name, count]) => ({ deaneryName: name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Parishioners by parish (mock since we don't have parishioner count)
    const parishionersByParish = parishes
      .slice(0, 10)
      .map((p: any) => ({
        parishName: p.parishName,
        count: p.parishionerCount || Math.floor(Math.random() * 3000) + 500,
      }))
      .sort((a: any, b: any) => b.count - a.count);

    // Growth data (mock)
    const currentYear = new Date().getFullYear();
    const growth = Array.from({ length: 6 }, (_, i) => ({
      year: String(currentYear - 5 + i),
      count: 180000 + i * 5000 + Math.floor(Math.random() * 2000),
    }));

    return { byDeanery, parishionersByParish, growth };
  }, [parishes]);

  // Process asset data
  const assetData = useMemo(() => {
    // By type
    const typeMap: Record<string, { count: number; value: number }> = {};
    assets.forEach((asset: any) => {
      const type = asset.assetType || 'other';
      if (!typeMap[type]) {
        typeMap[type] = { count: 0, value: 0 };
      }
      typeMap[type].count += 1;
      typeMap[type].value += asset.currentValue || 0;
    });

    const byType = Object.entries(typeMap).map(([type, data]) => ({
      type: assetTypeLabels[type] || type,
      count: data.count,
      value: data.value,
    }));

    // By parish
    const parishAssets: Record<string, { name: string; value: number }> = {};
    assets.forEach((asset: any) => {
      const parishId = asset.parishId?._id || asset.parishId || 'tgm';
      const parishName = asset.parishName ||
        parishes.find((p: any) => p._id === parishId)?.parishName ||
        'TGM BMT';

      if (!parishAssets[parishId]) {
        parishAssets[parishId] = { name: parishName, value: 0 };
      }
      parishAssets[parishId].value += asset.currentValue || 0;
    });

    const byParish = Object.values(parishAssets)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map(p => ({ parishName: p.name, value: p.value }));

    const totalValue = assets.reduce((sum: number, a: any) => sum + (a.currentValue || 0), 0);

    return { byType, byParish, totalValue };
  }, [assets, parishes]);

  // Summary stats
  const summaryStats = useMemo(() => ({
    totalParishes: stats.parishes,
    totalParishioners: 0,
    totalIncome: financialData.totalIncome,
    totalExpense: financialData.totalExpense,
    totalAssets: stats.assets,
    totalAssetValue: assetData.totalValue,
  }), [stats, financialData, assetData]);

  const tabs = [
    { key: 'tai_chinh' as const, label: 'Tài chính', icon: Wallet, count: 4, color: 'bg-yellow-500' },
    { key: 'giao_xu' as const, label: 'Giáo xứ', icon: Building2, count: 4, color: 'bg-orange-500' },
    { key: 'tong_hop' as const, label: 'Tổng hợp', icon: Layers, count: null, color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Đang tải dữ liệu...</span>
      </div>
    );
  }

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
              className={`h-12 px-6 text-base font-medium ${isActive ? `${tab.color} hover:opacity-90` : ''
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FundVsTargetChart data={financialData.fundVsTarget} />
            <MonthlyTrendChart data={financialData.monthlyTrend} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpenseCategoryChart data={financialData.expenseCategories} />
            <TopParishChart data={financialData.topParishes} />
          </div>
        </div>
      )}

      {activeTab === 'giao_xu' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ParishByDeaneryChart data={parishData.byDeanery} />
            <ParishionerByParishChart data={parishData.parishionersByParish} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AssetByTypeChart data={assetData.byType} />
            <AssetValueByParishChart data={assetData.byParish} />
          </div>
        </div>
      )}

      {activeTab === 'tong_hop' && (
        <div className="space-y-6">
          <SummaryCards stats={summaryStats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyTrendChart data={financialData.monthlyTrend} />
            <ParishionerGrowthChart data={parishData.growth} />
          </div>

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
                      {formatCompactCurrency(summaryStats.totalIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tổng Chi</span>
                    <span className="text-xl font-bold text-red-600">
                      {formatCompactCurrency(summaryStats.totalExpense)}
                    </span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-gray-900 font-medium">Dư</span>
                    <span className={`text-2xl font-bold ${summaryStats.totalIncome - summaryStats.totalExpense >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCompactCurrency(summaryStats.totalIncome - summaryStats.totalExpense)}
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
                  {financialData.fundVsTarget.slice(0, 4).map((fund, i) => (
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
                  {assetData.byType.map((asset) => (
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
