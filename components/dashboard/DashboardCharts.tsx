'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { formatCompactCurrency } from '@/lib/utils';

// Chart wrapper component with consistent styling
interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <Card className="border-2 h-full">
      <CardHeader className="pb-2">
        <div>
          <CardTitle className="text-lg font-bold text-gray-900">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm text-gray-500 mt-1">{description}</CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
}

// Custom tooltip formatter
const formatTooltipValue = (value: number) => formatCompactCurrency(value);

// Colors
const COLORS = {
  primary: '#6366f1',
  green: '#22c55e',
  red: '#ef4444',
  orange: '#f97316',
  purple: '#a855f7',
  blue: '#3b82f6',
  pink: '#ec4899',
  yellow: '#eab308',
  gray: '#6b7280',
};

const PIE_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#6b7280'];
const BAR_COLORS = ['#6366f1', '#3b82f6', '#22c55e', '#f97316', '#eab308'];

// 1. Thu theo Quỹ vs Mục tiêu - Horizontal Bar Chart with Group Filter
interface FundVsTargetData {
  fundName: string;
  actual: number;
  target: number;
  category?: 'A' | 'B' | 'C';
}

type FundGroupFilter = 'all' | 'A' | 'B' | 'C';

const FUND_GROUP_LABELS: Record<FundGroupFilter, string> = {
  all: 'Tất cả',
  A: 'Quỹ A',
  B: 'Quỹ B',
  C: 'Quỹ C',
};

export function FundVsTargetChart({ data }: { data: FundVsTargetData[] }) {
  const [selectedGroup, setSelectedGroup] = useState<FundGroupFilter>('all');

  // Filter and sort data: filter by group, sort by actual (descending), take top 5
  const filteredData = useMemo(() => {
    let filtered = data;

    // Filter by category if not "all"
    if (selectedGroup !== 'all') {
      filtered = data.filter(item => item.category === selectedGroup);
    }

    // Sort by actual income (descending) and take top 5
    return filtered
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 5);
  }, [data, selectedGroup]);

  // Get available groups (only show groups that have funds)
  const availableGroups = useMemo(() => {
    const groups = new Set<FundGroupFilter>(['all']);
    data.forEach(item => {
      if (item.category) {
        groups.add(item.category);
      }
    });
    return Array.from(groups);
  }, [data]);

  return (
    <ChartCard
      title="1. Thu theo Quỹ vs Mục tiêu"
      description="So sánh thực thu với chỉ tiêu từng quỹ (Top 5)"
    >
      {/* Group Filter Tabs */}
      <div className="flex flex-wrap gap-2 mt-3 mb-2">
        {availableGroups.map((group) => (
          <Button
            key={group}
            variant={selectedGroup === group ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedGroup(group)}
            className={`h-8 px-3 text-sm ${
              selectedGroup === group ? 'bg-blue-600 hover:bg-blue-700' : ''
            }`}
          >
            {FUND_GROUP_LABELS[group]}
            {group !== 'all' && (
              <span className="ml-1 text-xs opacity-75">
                ({data.filter(d => d.category === group).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      <div className="h-[280px]">
        {filteredData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Không có dữ liệu cho nhóm quỹ này
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={filteredData}
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`}
              />
              <YAxis dataKey="fundName" type="category" width={80} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => formatCompactCurrency(value)}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              <Bar dataKey="actual" fill={COLORS.green} name="Thực thu" radius={[0, 4, 4, 0]} />
              <Bar dataKey="target" fill="#e5e7eb" name="Mục tiêu" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}

// 2. Xu hướng Thu - Chi theo tháng - Area Chart
interface MonthlyTrendData {
  month: string;
  income: number;
  expense: number;
}

export function MonthlyTrendChart({ data }: { data: MonthlyTrendData[] }) {
  return (
    <ChartCard
      title="2. Xu hướng Thu - Chi theo tháng"
      description="Biến động thu chi qua các tháng trong năm"
    >
      <div className="h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.red} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.red} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`} />
            <Tooltip formatter={(value: number) => formatCompactCurrency(value)} />
            <Legend />
            <Area
              type="monotone"
              dataKey="income"
              stroke={COLORS.green}
              fillOpacity={1}
              fill="url(#colorIncome)"
              name="Thu"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke={COLORS.red}
              fillOpacity={1}
              fill="url(#colorExpense)"
              name="Chi"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// 3. Cơ cấu Chi tiêu theo Danh mục - Donut Chart
interface ExpenseCategoryData {
  name: string;
  value: number;
  percentage: number;
}

export function ExpenseCategoryChart({ data }: { data: ExpenseCategoryData[] }) {
  return (
    <ChartCard
      title="3. Cơ cấu Chi tiêu theo Danh mục"
      description="Tỷ lệ % chi tiêu cho từng mục đích"
    >
      <div className="h-[280px] mt-4 flex items-center">
        <div className="w-1/2">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCompactCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2 space-y-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <span className="text-gray-700">{item.name}:</span>
              <span className="font-semibold">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

// 4. Top 5 Giáo xứ đóng góp nhiều nhất - Bar Chart
interface TopParishData {
  parishName: string;
  amount: number;
}

export function TopParishChart({ data }: { data: TopParishData[] }) {
  return (
    <ChartCard
      title="5. Top 5 Giáo xứ đóng góp nhiều nhất"
      description="Xếp hạng GX theo tổng số tiền đóng góp"
    >
      <div className="h-[280px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="parishName"
              tick={{ fontSize: 11, angle: -15 }}
              interval={0}
              height={50}
            />
            <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`} />
            <Tooltip formatter={(value: number) => formatCompactCurrency(value)} />
            <Bar dataKey="amount" name="Đóng góp" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// 5. Số lượng Giáo xứ theo Giáo hạt - Bar Chart
interface ParishByDeaneryData {
  deaneryName: string;
  count: number;
}

export function ParishByDeaneryChart({ data }: { data: ParishByDeaneryData[] }) {
  return (
    <ChartCard
      title="1. Số lượng Giáo xứ theo Giáo hạt"
      description="Phân bố giáo xứ trong từng giáo hạt"
    >
      <div className="h-[280px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="deaneryName" tick={{ fontSize: 11 }} interval={0} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" name="Số giáo xứ" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// 6. Số Giáo dân theo Giáo xứ - Horizontal Bar Chart
interface ParishionerByParishData {
  parishName: string;
  count: number;
}

export function ParishionerByParishChart({ data }: { data: ParishionerByParishData[] }) {
  return (
    <ChartCard
      title="2. Top 10 Giáo xứ đông giáo dân nhất"
      description="Xếp hạng giáo xứ theo số lượng giáo dân"
    >
      <div className="h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis dataKey="parishName" type="category" width={80} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill={COLORS.blue} name="Số giáo dân" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// 7. Tài sản theo Loại - Pie Chart
interface AssetByTypeData {
  type: string;
  count: number;
  value: number;
}

export function AssetByTypeChart({ data }: { data: AssetByTypeData[] }) {
  return (
    <ChartCard
      title="3. Tài sản theo Loại"
      description="Phân bố tài sản theo từng loại hình"
    >
      <div className="h-[280px] mt-4 flex items-center">
        <div className="w-1/2">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2 space-y-2">
          {data.map((item, index) => (
            <div key={item.type} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <span className="text-gray-700">{item.type}:</span>
              <span className="font-semibold">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

// 8. Tăng trưởng giáo dân theo năm - Line Chart
interface GrowthData {
  year: string;
  count: number;
}

export function ParishionerGrowthChart({ data }: { data: GrowthData[] }) {
  return (
    <ChartCard
      title="4. Tăng trưởng giáo dân theo năm"
      description="Xu hướng biến động số lượng giáo dân"
    >
      <div className="h-[280px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke={COLORS.primary}
              strokeWidth={3}
              dot={{ r: 5, fill: COLORS.primary }}
              name="Số giáo dân"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// 9. Giá trị Tài sản theo Giáo xứ
interface AssetValueByParishData {
  parishName: string;
  value: number;
}

export function AssetValueByParishChart({ data }: { data: AssetValueByParishData[] }) {
  return (
    <ChartCard
      title="5. Giá trị tài sản theo Giáo xứ"
      description="Top giáo xứ có tổng giá trị tài sản cao nhất"
    >
      <div className="h-[280px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="parishName" tick={{ fontSize: 11 }} interval={0} />
            <YAxis tickFormatter={(value) => `${(value / 1000000000).toFixed(1)}tỷ`} />
            <Tooltip formatter={(value: number) => formatCompactCurrency(value)} />
            <Bar dataKey="value" name="Giá trị" fill={COLORS.orange} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// Summary Statistics Cards
interface SummaryStats {
  totalParishes: number;
  totalParishioners: number;
  totalIncome: number;
  totalExpense: number;
  totalAssets: number;
  totalAssetValue: number;
}

export function SummaryCards({ stats }: { stats: SummaryStats }) {
  const cards = [
    { label: 'Tổng Giáo xứ', value: stats.totalParishes, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { label: 'Tổng Giáo dân', value: stats.totalParishioners.toLocaleString('vi-VN'), color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Tổng Thu', value: formatCompactCurrency(stats.totalIncome), color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'Tổng Chi', value: formatCompactCurrency(stats.totalExpense), color: 'text-red-600', bgColor: 'bg-red-100' },
    { label: 'Tổng Tài sản', value: stats.totalAssets, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { label: 'Giá trị Tài sản', value: formatCompactCurrency(stats.totalAssetValue), color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-2">
          <CardContent className="p-4">
            <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center mb-2`}>
              <span className={`text-lg font-bold ${card.color}`}>#</span>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-sm text-gray-600">{card.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
