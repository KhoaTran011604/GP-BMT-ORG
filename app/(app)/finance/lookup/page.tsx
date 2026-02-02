'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Download,
  Eye,
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Building2,
  Wallet,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatCompactCurrency } from '@/lib/utils';
import { Fund, Parish } from '@/lib/schemas';
import { TransactionDetailDialog } from '@/components/finance/transactions/TransactionDialogs';
import { TransactionItem } from '@/components/finance/transactions/TransactionTable';
import { ImageGallery } from '@/components/finance/ImageGallery';

type TransactionType = 'all' | 'income' | 'expense';
type StatusFilter = 'approved' | 'pending' | 'rejected';
type DateMode = 'preset' | 'custom';
type DatePreset =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'
  | 'thisYear'
  | 'lastYear'
  | null;

const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'today', label: 'Hôm nay' },
  { key: 'yesterday', label: 'Hôm qua' },
  { key: 'last7days', label: '7 ngày qua' },
  { key: 'last30days', label: '30 ngày qua' },
  { key: 'thisMonth', label: 'Tháng này' },
  { key: 'lastMonth', label: 'Tháng trước' },
  { key: 'thisQuarter', label: 'Quý này' },
  { key: 'lastQuarter', label: 'Quý trước' },
  { key: 'thisYear', label: 'Năm nay' },
  { key: 'lastYear', label: 'Năm ngoái' },
];

const getDateRangeFromPreset = (preset: DatePreset): { dateFrom: string; dateTo: string } => {
  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  switch (preset) {
    case 'today':
      return { dateFrom: formatDate(today), dateTo: formatDate(today) };

    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { dateFrom: formatDate(yesterday), dateTo: formatDate(yesterday) };
    }

    case 'last7days': {
      const last7 = new Date(today);
      last7.setDate(last7.getDate() - 6);
      return { dateFrom: formatDate(last7), dateTo: formatDate(today) };
    }

    case 'last30days': {
      const last30 = new Date(today);
      last30.setDate(last30.getDate() - 29);
      return { dateFrom: formatDate(last30), dateTo: formatDate(today) };
    }

    case 'thisMonth': {
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { dateFrom: formatDate(firstOfMonth), dateTo: formatDate(today) };
    }

    case 'lastMonth': {
      const firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return { dateFrom: formatDate(firstOfLastMonth), dateTo: formatDate(lastOfLastMonth) };
    }

    case 'thisQuarter': {
      const quarter = Math.floor(today.getMonth() / 3);
      const firstOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
      return { dateFrom: formatDate(firstOfQuarter), dateTo: formatDate(today) };
    }

    case 'lastQuarter': {
      const currentQuarter = Math.floor(today.getMonth() / 3);
      const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
      const year = currentQuarter === 0 ? today.getFullYear() - 1 : today.getFullYear();
      const firstOfLastQuarter = new Date(year, lastQuarter * 3, 1);
      const lastOfLastQuarter = new Date(year, (lastQuarter + 1) * 3, 0);
      return { dateFrom: formatDate(firstOfLastQuarter), dateTo: formatDate(lastOfLastQuarter) };
    }

    case 'thisYear': {
      const firstOfYear = new Date(today.getFullYear(), 0, 1);
      return { dateFrom: formatDate(firstOfYear), dateTo: formatDate(today) };
    }

    case 'lastYear': {
      const firstOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
      const lastOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
      return { dateFrom: formatDate(firstOfLastYear), dateTo: formatDate(lastOfLastYear) };
    }

    default:
      return { dateFrom: '', dateTo: '' };
  }
};

interface SearchFilters {
  searchTerm: string;
  transactionType: TransactionType;
  parishId: string;
  fundId: string;
  statuses: StatusFilter[];
  dateFrom: string;
  dateTo: string;
  amountFrom: string;
  amountTo: string;
}

const ITEMS_PER_PAGE = 10;

export default function TransactionLookupPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  // Detail dialog states
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);
  const [showGallery, setShowGallery] = useState(false);

  // Date filter mode
  const [dateMode, setDateMode] = useState<DateMode>('preset');
  const [datePreset, setDatePreset] = useState<DatePreset>(null);

  // Filters
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    transactionType: 'all',
    parishId: 'all',
    fundId: 'all',
    statuses: ['approved', 'pending'],
    dateFrom: '',
    dateTo: '',
    amountFrom: '',
    amountTo: '',
  });

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [fundsRes, parishesRes] = await Promise.all([
        fetch('/api/funds'),
        fetch('/api/parishes'),
      ]);

      if (fundsRes.ok) {
        const fundsData = await fundsRes.json();
        setFunds(fundsData.data || []);
      }

      if (parishesRes.ok) {
        const parishesData = await parishesRes.json();
        setParishes(parishesData.data || []);
      }
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setCurrentPage(1);

    try {
      const results: TransactionItem[] = [];

      // Build query params
      const buildParams = (type: 'income' | 'expense') => {
        const params = new URLSearchParams();

        if (filters.parishId && filters.parishId !== 'all') {
          params.append('parishId', filters.parishId);
        }
        if (filters.fundId && filters.fundId !== 'all') {
          params.append('fundId', filters.fundId);
        }
        if (filters.dateFrom) {
          params.append('dateFrom', filters.dateFrom);
        }
        if (filters.dateTo) {
          params.append('dateTo', filters.dateTo);
        }
        if (filters.statuses.length > 0 && filters.statuses.length < 3) {
          filters.statuses.forEach(s => params.append('status', s));
        }

        return params;
      };

      // Fetch incomes if needed
      if (filters.transactionType === 'all' || filters.transactionType === 'income') {
        const incomeParams = buildParams('income');
        const incomeRes = await fetch(`/api/incomes?${incomeParams}`);
        if (incomeRes.ok) {
          const incomeData = await incomeRes.json();
          const incomes = (incomeData.data || []).map((item: any) => ({
            _id: item._id,
            type: 'income' as const,
            code: item.incomeCode,
            date: item.incomeDate,
            amount: item.amount,
            payerPayee: item.payerName,
            paymentMethod: item.paymentMethod,
            status: item.status,
            images: item.images || [],
            description: item.description,
            notes: item.notes,
            parishId: item.parishId,
            fundId: item.fundId,
            bankAccount: item.bankAccount,
            fiscalYear: item.fiscalYear,
            fiscalPeriod: item.fiscalPeriod,
            submittedAt: item.createdAt,
            sourceType: item.sourceType,
            senderId: item.senderId,
            senderBankName: item.senderBankName,
            senderBankAccount: item.senderBankAccount,
          }));
          results.push(...incomes);
        }
      }

      // Fetch expenses if needed
      if (filters.transactionType === 'all' || filters.transactionType === 'expense') {
        const expenseParams = buildParams('expense');
        const expenseRes = await fetch(`/api/expenses?${expenseParams}`);
        if (expenseRes.ok) {
          const expenseData = await expenseRes.json();
          const expenses = (expenseData.data || []).map((item: any) => ({
            _id: item._id,
            type: 'expense' as const,
            code: item.expenseCode,
            date: item.expenseDate,
            amount: item.amount,
            payerPayee: item.receiverName,
            paymentMethod: item.paymentMethod,
            status: item.status,
            images: item.images || [],
            description: item.description,
            notes: item.notes,
            parishId: item.parishId,
            categoryId: item.categoryId,
            bankAccount: item.bankAccount,
            fiscalYear: item.fiscalYear,
            fiscalPeriod: item.fiscalPeriod,
            submittedAt: item.createdAt,
            receiverId: item.receiverId,
            receiverBankName: item.receiverBankName,
            receiverBankAccount: item.receiverBankAccount,
          }));
          results.push(...expenses);
        }
      }

      setTransactions(results);
    } catch (error) {
      console.error('Error searching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Filter by search term
    if (filters.searchTerm.trim()) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(t =>
        t.code.toLowerCase().includes(term) ||
        t.payerPayee?.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term)
      );
    }

    // Filter by amount range
    if (filters.amountFrom) {
      const minAmount = parseFloat(filters.amountFrom);
      result = result.filter(t => t.amount >= minAmount);
    }
    if (filters.amountTo) {
      const maxAmount = parseFloat(filters.amountTo);
      result = result.filter(t => t.amount <= maxAmount);
    }

    // Filter by status
    if (filters.statuses.length > 0 && filters.statuses.length < 3) {
      result = result.filter(t => filters.statuses.includes(t.status as StatusFilter));
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (sortBy === 'newest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'amount_high') return b.amount - a.amount;
      if (sortBy === 'amount_low') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [transactions, filters.searchTerm, filters.amountFrom, filters.amountTo, filters.statuses, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate totals
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  const handleStatusToggle = (status: StatusFilter) => {
    setFilters(prev => {
      const newStatuses = prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status];
      return { ...prev, statuses: newStatuses };
    });
  };

  const handleDatePresetSelect = (preset: DatePreset) => {
    if (datePreset === preset) {
      // Deselect if clicking the same preset
      setDatePreset(null);
      setFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }));
    } else {
      setDatePreset(preset);
      const range = getDateRangeFromPreset(preset);
      setFilters(prev => ({ ...prev, ...range }));
    }
  };

  const handleDateModeChange = (mode: DateMode) => {
    setDateMode(mode);
    if (mode === 'preset') {
      // Clear custom dates when switching to preset mode
      if (!datePreset) {
        setFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }));
      }
    } else {
      // Clear preset when switching to custom mode
      setDatePreset(null);
    }
  };

  const handleExportExcel = () => {
    if (filteredTransactions.length === 0) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    // Build CSV content
    const headers = ['Mã giao dịch', 'Loại', 'Ngày', 'Số tiền', 'Người nộp/nhận', 'Hình thức', 'Trạng thái', 'Diễn giải'];
    const rows = filteredTransactions.map(t => [
      t.code,
      t.type === 'income' ? 'Thu' : 'Chi',
      new Date(t.date).toLocaleDateString('vi-VN'),
      t.amount.toString(),
      t.payerPayee || '',
      t.paymentMethod === 'online' ? 'Chuyển khoản' : 'Tiền mặt',
      t.status === 'approved' ? 'Đã duyệt' : t.status === 'pending' ? 'Chờ duyệt' : 'Từ chối',
      t.description || '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Add BOM for UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tra-cuu-thu-chi-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getParishName = (parishId?: string) => {
    if (!parishId) return 'TGM BMT';
    const parish = parishes.find(p => p._id?.toString() === parishId);
    return parish?.parishName || 'TGM BMT';
  };

  const getFundName = (fundId?: string) => {
    if (!fundId) return '';
    const fund = funds.find(f => f._id?.toString() === fundId);
    return fund?.fundName || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Tra cứu Thu Chi</h1>
          <p className="page-description">Tìm kiếm và tra cứu các khoản thu chi với bộ lọc nâng cao</p>
        </div>
      </div>

      {/* Search Box */}
      <Card className="border-2">
        <CardContent className="p-6">
          {/* Main Search Bar */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Nhập mã phiếu, tên người nộp, giáo xứ..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="pl-12 h-14 text-lg border-2"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              className={`h-14 px-6 text-base font-medium border-2 ${showAdvancedFilter ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}
            >
              <Filter size={20} className="mr-2" />
              Bộ lọc
              {showAdvancedFilter ? <ChevronUp size={18} className="ml-2" /> : <ChevronDown size={18} className="ml-2" />}
            </Button>
            <Button
              onClick={handleSearch}
              className="h-14 px-8 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </Button>
          </div>

          {/* Quick Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Transaction Type */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Loại giao dịch</label>
              <div className="flex gap-1">
                <Button
                  variant={filters.transactionType === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilters({ ...filters, transactionType: 'all' })}
                  className="flex-1 h-12 text-base"
                >
                  Tất cả
                </Button>
                <Button
                  variant={filters.transactionType === 'income' ? 'default' : 'outline'}
                  onClick={() => setFilters({ ...filters, transactionType: 'income' })}
                  className={`flex-1 h-12 text-base ${filters.transactionType === 'income' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  <ArrowDownCircle size={18} className="mr-1" />
                  Thu
                </Button>
                <Button
                  variant={filters.transactionType === 'expense' ? 'default' : 'outline'}
                  onClick={() => setFilters({ ...filters, transactionType: 'expense' })}
                  className={`flex-1 h-12 text-base ${filters.transactionType === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                >
                  <ArrowUpCircle size={18} className="mr-1" />
                  Chi
                </Button>
              </div>
            </div>

            {/* Parish */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Giáo xứ</label>
              <Select value={filters.parishId} onValueChange={(v) => setFilters({ ...filters, parishId: v })}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-base py-3">Tất cả</SelectItem>
                  {parishes.map((p) => (
                    <SelectItem key={p._id?.toString()} value={p._id?.toString() || ''} className="text-base py-3">
                      {p.parishName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fund */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Loại quỹ</label>
              <Select value={filters.fundId} onValueChange={(v) => setFilters({ ...filters, fundId: v })}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-base py-3">Tất cả</SelectItem>
                  {funds.map((f) => (
                    <SelectItem key={f._id?.toString()} value={f._id?.toString() || ''} className="text-base py-3">
                      {f.fundName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Trạng thái</label>
              <div className="flex gap-3 h-12 items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.statuses.includes('approved')}
                    onCheckedChange={() => handleStatusToggle('approved')}
                    className="h-5 w-5"
                  />
                  <span className="text-base">Đã duyệt</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.statuses.includes('pending')}
                    onCheckedChange={() => handleStatusToggle('pending')}
                    className="h-5 w-5"
                  />
                  <span className="text-base">Chờ duyệt</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.statuses.includes('rejected')}
                    onCheckedChange={() => handleStatusToggle('rejected')}
                    className="h-5 w-5"
                  />
                  <span className="text-base">Từ chối</span>
                </label>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilter && (
            <div className="pt-4 border-t space-y-4">
              {/* Date Range Filter */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={18} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Khoảng thời gian</span>
                </div>

                {/* Mode Tabs */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={dateMode === 'preset' ? 'default' : 'outline'}
                    onClick={() => handleDateModeChange('preset')}
                    className="h-10 px-6 text-base"
                  >
                    Gợi ý
                  </Button>
                  <Button
                    variant={dateMode === 'custom' ? 'default' : 'outline'}
                    onClick={() => handleDateModeChange('custom')}
                    className="h-10 px-6 text-base"
                  >
                    Tùy chỉnh
                  </Button>
                </div>

                {/* Preset Mode */}
                {dateMode === 'preset' && (
                  <div className="flex flex-wrap gap-2">
                    {DATE_PRESETS.map((preset) => (
                      <Button
                        key={preset.key}
                        variant={datePreset === preset.key ? 'default' : 'outline'}
                        onClick={() => handleDatePresetSelect(preset.key)}
                        className={`h-10 px-4 text-base ${
                          datePreset === preset.key ? 'bg-blue-600 hover:bg-blue-700' : ''
                        }`}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Custom Mode */}
                {dateMode === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Từ ngày</label>
                      <Input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        className="h-12 text-base"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Đến ngày</label>
                      <Input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        className="h-12 text-base"
                      />
                    </div>
                  </div>
                )}

                {/* Show selected date range */}
                {(filters.dateFrom || filters.dateTo) && (
                  <div className="mt-3 text-sm text-gray-600 bg-white rounded px-3 py-2 border">
                    Đã chọn: {filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString('vi-VN') : '...'}
                    {' → '}
                    {filters.dateTo ? new Date(filters.dateTo).toLocaleDateString('vi-VN') : '...'}
                  </div>
                )}
              </div>

              {/* Amount Range Filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Số tiền từ</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.amountFrom}
                    onChange={(e) => setFilters({ ...filters, amountFrom: e.target.value })}
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Số tiền đến</label>
                  <Input
                    type="number"
                    placeholder="10,000,000"
                    value={filters.amountTo}
                    onChange={(e) => setFilters({ ...filters, amountTo: e.target.value })}
                    className="h-12 text-base"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {transactions.length > 0 && (
        <>
          {/* Results Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                Kết quả: <span className="text-blue-600">{filteredTransactions.length}</span> bản ghi
              </h2>
              {totals.net !== 0 && (
                <Badge className={`text-base px-4 py-2 ${totals.net >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  Tổng: {formatCompactCurrency(totals.income)} - {formatCompactCurrency(totals.expense)} = {formatCompactCurrency(totals.net)} ({totals.net >= 0 ? 'Dư' : 'Thiếu'})
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest" className="text-base py-3">Ngày mới nhất</SelectItem>
                  <SelectItem value="oldest" className="text-base py-3">Ngày cũ nhất</SelectItem>
                  <SelectItem value="amount_high" className="text-base py-3">Số tiền cao nhất</SelectItem>
                  <SelectItem value="amount_low" className="text-base py-3">Số tiền thấp nhất</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleExportExcel}
                className="h-12 px-6 text-base font-medium border-green-300 text-green-700 hover:bg-green-50"
              >
                <FileSpreadsheet size={20} className="mr-2" />
                Xuất Excel
              </Button>
            </div>
          </div>

          {/* Transaction Cards */}
          <div className="space-y-4">
            {paginatedTransactions.map((transaction) => (
              <Card
                key={transaction._id}
                className="border-2 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  setSelectedTransaction(transaction);
                  setShowDetailDialog(true);
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    {/* Left Section */}
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowDownCircle className="text-green-600" size={24} />
                        ) : (
                          <ArrowUpCircle className="text-red-600" size={24} />
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-bold text-lg">{transaction.code}</span>
                          <Badge className={`text-sm px-3 py-1 ${
                            transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type === 'income' ? (
                              <><ArrowDownCircle size={14} className="mr-1" /> THU</>
                            ) : (
                              <><ArrowUpCircle size={14} className="mr-1" /> CHI</>
                            )}
                          </Badge>
                          <Badge className={`text-sm px-3 py-1 ${
                            transaction.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.status === 'approved' ? 'Đã duyệt' :
                             transaction.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                          </Badge>
                        </div>
                        <p className="text-base text-gray-700 mb-2">
                          {transaction.description || transaction.payerPayee || 'Không có diễn giải'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Building2 size={14} />
                            {getParishName(transaction.parishId)}
                          </span>
                          {transaction.fundId && (
                            <span className="flex items-center gap-1">
                              <Wallet size={14} />
                              {getFundName(transaction.fundId)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(transaction.date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Amount */}
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'expense' ? '-' : '+'}{formatCompactCurrency(transaction.amount)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-blue-600 hover:text-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTransaction(transaction);
                          setShowDetailDialog(true);
                        }}
                      >
                        <Eye size={16} className="mr-1" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-base text-gray-600">
                Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} trong tổng số {filteredTransactions.length} kết quả
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-10 px-4"
                >
                  <ChevronLeft size={18} className="mr-1" />
                  Trước
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="h-10 w-10"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-10 px-4"
                >
                  Sau
                  <ChevronRight size={18} className="ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && transactions.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Search className="mx-auto mb-4 text-gray-300" size={64} />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nhập thông tin để tìm kiếm</h3>
            <p className="text-base text-gray-500">Sử dụng bộ lọc phía trên để tìm kiếm các khoản thu chi</p>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <TransactionDetailDialog
        open={showDetailDialog}
        onOpenChange={(open) => {
          setShowDetailDialog(open);
          if (!open) setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onViewImages={() => setShowGallery(true)}
        canManageApprovals={false}
      />

      {/* Image Gallery */}
      {selectedTransaction && (
        <ImageGallery
          images={selectedTransaction.images}
          open={showGallery}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  );
}
