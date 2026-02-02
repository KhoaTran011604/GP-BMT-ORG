'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Fund, Parish } from '@/lib/schemas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type DateRangePreset =
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
    | 'custom';

interface TransactionFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusChange: (value: string) => void;
    parishFilter: string;
    onParishChange: (value: string) => void;
    fundFilter: string;
    onFundChange: (value: string) => void;
    paymentMethodFilter: string;
    onPaymentMethodChange: (value: string) => void;
    amountMin: string;
    onAmountMinChange: (value: string) => void;
    amountMax: string;
    onAmountMaxChange: (value: string) => void;
    fiscalYearFilter: string;
    onFiscalYearChange: (value: string) => void;
    fiscalPeriodFilter: string;
    onFiscalPeriodChange: (value: string) => void;
    showAdvancedFilter: boolean;
    onToggleAdvancedFilter: () => void;
    onResetFilters: () => void;
    hasActiveFilters: boolean;
    parishes: Parish[];
    funds: Fund[];
    // Date range props
    dateFrom: string;
    dateTo: string;
    onDateFromChange: (date: string) => void;
    onDateToChange: (date: string) => void;
    onDateReset: () => void;
    // Apply filter callback
    onApplyFilters: () => void;
}

export function TransactionFilters({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusChange,
    parishFilter,
    onParishChange,
    fundFilter,
    onFundChange,
    paymentMethodFilter,
    onPaymentMethodChange,
    amountMin,
    onAmountMinChange,
    amountMax,
    onAmountMaxChange,
    fiscalYearFilter,
    onFiscalYearChange,
    fiscalPeriodFilter,
    onFiscalPeriodChange,
    showAdvancedFilter,
    onToggleAdvancedFilter,
    onResetFilters,
    hasActiveFilters,
    parishes,
    funds,
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
    onDateReset,
    onApplyFilters,
}: TransactionFiltersProps) {
    // Local state for filters (only synced to parent on Apply)
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter);
    const [localParishFilter, setLocalParishFilter] = useState(parishFilter);
    const [localFundFilter, setLocalFundFilter] = useState(fundFilter);
    const [localPaymentMethodFilter, setLocalPaymentMethodFilter] = useState(paymentMethodFilter);
    const [localAmountMin, setLocalAmountMin] = useState(amountMin);
    const [localAmountMax, setLocalAmountMax] = useState(amountMax);
    const [localFiscalYearFilter, setLocalFiscalYearFilter] = useState(fiscalYearFilter);
    const [localFiscalPeriodFilter, setLocalFiscalPeriodFilter] = useState(fiscalPeriodFilter);
    const [localDateFrom, setLocalDateFrom] = useState(dateFrom);
    const [localDateTo, setLocalDateTo] = useState(dateTo);

    // Sync local state when drawer opens
    useEffect(() => {
        if (showAdvancedFilter) {
            setLocalSearchTerm(searchTerm);
            setLocalStatusFilter(statusFilter);
            setLocalParishFilter(parishFilter);
            setLocalFundFilter(fundFilter);
            setLocalPaymentMethodFilter(paymentMethodFilter);
            setLocalAmountMin(amountMin);
            setLocalAmountMax(amountMax);
            setLocalFiscalYearFilter(fiscalYearFilter);
            setLocalFiscalPeriodFilter(fiscalPeriodFilter);
            setLocalDateFrom(dateFrom);
            setLocalDateTo(dateTo);
        }
    }, [showAdvancedFilter]);

    const hasLocalDateRange = localDateFrom || localDateTo;

    // Count active filters from parent state (for badge display)
    const activeFilterCount = [
        statusFilter !== 'all',
        searchTerm,
        parishFilter !== 'all',
        fundFilter !== 'all',
        paymentMethodFilter !== 'all',
        amountMin,
        amountMax,
        fiscalYearFilter !== 'all',
        fiscalPeriodFilter !== 'all',
        dateFrom || dateTo,
    ].filter(Boolean).length;

    // Count local active filters (for summary display inside drawer)
    const localActiveFilterCount = [
        localStatusFilter !== 'all',
        localSearchTerm,
        localParishFilter !== 'all',
        localFundFilter !== 'all',
        localPaymentMethodFilter !== 'all',
        localAmountMin,
        localAmountMax,
        localFiscalYearFilter !== 'all',
        localFiscalPeriodFilter !== 'all',
        hasLocalDateRange,
    ].filter(Boolean).length;

    const currentYear = new Date().getFullYear();
    const fiscalYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

    // Date range picker logic
    const getDateRange = (preset: DateRangePreset): { from: string; to: string } => {
        const today = new Date();
        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        switch (preset) {
            case 'today':
                return { from: formatDate(today), to: formatDate(today) };
            case 'yesterday': {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                return { from: formatDate(yesterday), to: formatDate(yesterday) };
            }
            case 'last7days': {
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
                return { from: formatDate(sevenDaysAgo), to: formatDate(today) };
            }
            case 'last30days': {
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
                return { from: formatDate(thirtyDaysAgo), to: formatDate(today) };
            }
            case 'thisMonth': {
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                return { from: formatDate(firstDay), to: formatDate(today) };
            }
            case 'lastMonth': {
                const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                return { from: formatDate(firstDayLastMonth), to: formatDate(lastDayLastMonth) };
            }
            case 'thisQuarter': {
                const quarter = Math.floor(today.getMonth() / 3);
                const firstDayQuarter = new Date(today.getFullYear(), quarter * 3, 1);
                return { from: formatDate(firstDayQuarter), to: formatDate(today) };
            }
            case 'lastQuarter': {
                const quarter = Math.floor(today.getMonth() / 3);
                const firstDayLastQuarter = new Date(today.getFullYear(), (quarter - 1) * 3, 1);
                const lastDayLastQuarter = new Date(today.getFullYear(), quarter * 3, 0);
                return { from: formatDate(firstDayLastQuarter), to: formatDate(lastDayLastQuarter) };
            }
            case 'thisYear': {
                const firstDayYear = new Date(today.getFullYear(), 0, 1);
                return { from: formatDate(firstDayYear), to: formatDate(today) };
            }
            case 'lastYear': {
                const firstDayLastYear = new Date(today.getFullYear() - 1, 0, 1);
                const lastDayLastYear = new Date(today.getFullYear() - 1, 11, 31);
                return { from: formatDate(firstDayLastYear), to: formatDate(lastDayLastYear) };
            }
            default:
                return { from: '', to: '' };
        }
    };

    const applyPreset = (preset: DateRangePreset) => {
        const range = getDateRange(preset);
        setLocalDateFrom(range.from);
        setLocalDateTo(range.to);
    };

    const getMinDate = () => {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        return twoYearsAgo.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    const presets: Array<{ value: Exclude<DateRangePreset, 'custom'>; label: string }> = [
        { value: 'today', label: 'Hôm nay' },
        { value: 'yesterday', label: 'Hôm qua' },
        { value: 'last7days', label: '7 ngày qua' },
        { value: 'last30days', label: '30 ngày qua' },
        { value: 'thisMonth', label: 'Tháng này' },
        { value: 'lastMonth', label: 'Tháng trước' },
        { value: 'thisQuarter', label: 'Quý này' },
        { value: 'lastQuarter', label: 'Quý trước' },
        { value: 'thisYear', label: 'Năm nay' },
        { value: 'lastYear', label: 'Năm ngoái' },
    ];

    const formatDisplayDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const handleLocalDateReset = () => {
        setLocalDateFrom('');
        setLocalDateTo('');
    };

    // Apply all local filters to parent state
    const handleApply = () => {
        onSearchChange(localSearchTerm);
        onStatusChange(localStatusFilter);
        onParishChange(localParishFilter);
        onFundChange(localFundFilter);
        onPaymentMethodChange(localPaymentMethodFilter);
        onAmountMinChange(localAmountMin);
        onAmountMaxChange(localAmountMax);
        onFiscalYearChange(localFiscalYearFilter);
        onFiscalPeriodChange(localFiscalPeriodFilter);
        onDateFromChange(localDateFrom);
        onDateToChange(localDateTo);
        onApplyFilters();
        onToggleAdvancedFilter();
    };

    // Reset and apply
    const handleResetAndApply = () => {
        onSearchChange('');
        onStatusChange('all');
        onParishChange('all');
        onFundChange('all');
        onPaymentMethodChange('all');
        onAmountMinChange('');
        onAmountMaxChange('');
        onFiscalYearChange('all');
        onFiscalPeriodChange('all');
        onDateFromChange('');
        onDateToChange('');
        onApplyFilters();
        onToggleAdvancedFilter();
    };

    return (
        <Sheet open={showAdvancedFilter} onOpenChange={onToggleAdvancedFilter}>
            <SheetTrigger asChild>
                <Button
                    variant={activeFilterCount > 0 ? "default" : "outline"}
                    className="h-10 px-5 text-base gap-2"
                >
                    <Filter size={20} />
                    Bộ lọc
                    {activeFilterCount > 0 && (
                        <Badge className="ml-1 bg-red-500 text-white text-sm px-2 py-0.5">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[480px] sm:w-[540px] sm:max-w-[540px] overflow-y-auto px-6">
                <SheetHeader className="pb-4">
                    <SheetTitle className="flex items-center gap-2">
                        <Filter size={18} />
                        Bộ lọc nâng cao
                    </SheetTitle>
                </SheetHeader>

                <div className="space-y-5">
                    {/* Search - Đặt lên đầu */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-600">Tìm kiếm</Label>
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Mã GD, người nộp/nhận..."
                                value={localSearchTerm}
                                onChange={(e) => setLocalSearchTerm(e.target.value)}
                                className="pl-8 h-9"
                            />
                        </div>
                    </div>

                    {/* Date Range Section */}
                    <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-500" />
                            <Label className="text-xs font-medium">Khoảng thời gian</Label>
                        </div>
                        <Tabs defaultValue="quick" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-8">
                                <TabsTrigger value="quick" className="text-xs">Gợi ý</TabsTrigger>
                                <TabsTrigger value="custom" className="text-xs">Tùy chỉnh</TabsTrigger>
                            </TabsList>
                            <TabsContent value="quick" className="mt-2">
                                <div className="grid grid-cols-5 gap-1.5">
                                    {presets.map((preset) => (
                                        <Button
                                            key={preset.value}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => applyPreset(preset.value)}
                                            className="h-7 px-2 text-[11px]"
                                        >
                                            {preset.label}
                                        </Button>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="custom" className="mt-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500">Từ ngày</Label>
                                        <Input
                                            type="date"
                                            value={localDateFrom}
                                            onChange={(e) => setLocalDateFrom(e.target.value)}
                                            min={getMinDate()}
                                            max={localDateTo || getMaxDate()}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500">Đến ngày</Label>
                                        <Input
                                            type="date"
                                            value={localDateTo}
                                            onChange={(e) => setLocalDateTo(e.target.value)}
                                            min={localDateFrom || getMinDate()}
                                            max={getMaxDate()}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                        {hasLocalDateRange && (
                            <div className="flex items-center justify-between px-2 py-1.5 bg-blue-100 rounded text-xs">
                                <span className="text-blue-700">
                                    {localDateFrom && localDateTo
                                        ? `${formatDisplayDate(localDateFrom)} - ${formatDisplayDate(localDateTo)}`
                                        : localDateFrom
                                            ? `Từ ${formatDisplayDate(localDateFrom)}`
                                            : `Đến ${formatDisplayDate(localDateTo)}`
                                    }
                                </span>
                                <button onClick={handleLocalDateReset} className="text-blue-700 hover:text-red-600 p-0.5">
                                    <X size={12} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Filters Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Status Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600">Trạng thái</Label>
                            <Select value={localStatusFilter} onValueChange={setLocalStatusFilter}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Tất cả" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                                    <SelectItem value="approved">Đã duyệt</SelectItem>
                                    <SelectItem value="rejected">Từ chối</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Payment Method Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600">Hình thức</Label>
                            <Select value={localPaymentMethodFilter} onValueChange={setLocalPaymentMethodFilter}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Tất cả" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="offline">Tiền mặt</SelectItem>
                                    <SelectItem value="online">Chuyển khoản</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Parish Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600">Giáo xứ</Label>
                            <Select value={localParishFilter} onValueChange={setLocalParishFilter}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Tất cả" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    {parishes.filter(p => p._id).map((p) => (
                                        <SelectItem key={p._id!.toString()} value={p._id!.toString()}>
                                            {p.parishName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Fund Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600">Quỹ</Label>
                            <Select value={localFundFilter} onValueChange={setLocalFundFilter}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Tất cả" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    {funds.filter(f => f._id).map((f) => (
                                        <SelectItem key={f._id!.toString()} value={f._id!.toString()}>
                                            {f.fundName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Fiscal Year */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600">Năm tài chính</Label>
                            <Select value={localFiscalYearFilter} onValueChange={setLocalFiscalYearFilter}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Tất cả" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    {fiscalYears.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Fiscal Period */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600">Kỳ tài chính</Label>
                            <Select value={localFiscalPeriodFilter} onValueChange={setLocalFiscalPeriodFilter}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Tất cả" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                        <SelectItem key={month} value={month.toString()}>
                                            Tháng {month}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Amount Min */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600">Số tiền từ</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={localAmountMin}
                                onChange={(e) => setLocalAmountMin(e.target.value)}
                                className="h-9"
                            />
                        </div>

                        {/* Amount Max */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600">Số tiền đến</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={localAmountMax}
                                onChange={(e) => setLocalAmountMax(e.target.value)}
                                className="h-9"
                            />
                        </div>
                    </div>

                    {/* Active filters summary (local state) */}
                    {localActiveFilterCount > 0 && (
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 font-medium">Đang chọn:</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResetAndApply}
                                    className="text-red-600 hover:text-red-700 h-6 text-xs px-2"
                                >
                                    <X size={12} className="mr-1" />
                                    Xóa tất cả
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {hasLocalDateRange && (
                                    <Badge variant="secondary" className="text-[10px] h-5">
                                        {localDateFrom && localDateTo
                                            ? `${formatDisplayDate(localDateFrom)} - ${formatDisplayDate(localDateTo)}`
                                            : localDateFrom
                                                ? `Từ ${formatDisplayDate(localDateFrom)}`
                                                : `Đến ${formatDisplayDate(localDateTo)}`
                                        }
                                        <button onClick={handleLocalDateReset} className="ml-1 hover:text-red-500">×</button>
                                    </Badge>
                                )}
                                {localStatusFilter !== 'all' && (
                                    <Badge variant="secondary" className="text-[10px] h-5">
                                        {localStatusFilter === 'pending' ? 'Chờ duyệt' : localStatusFilter === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                                        <button onClick={() => setLocalStatusFilter('all')} className="ml-1 hover:text-red-500">×</button>
                                    </Badge>
                                )}
                                {localSearchTerm && (
                                    <Badge variant="secondary" className="text-[10px] h-5">
                                        "{localSearchTerm}"
                                        <button onClick={() => setLocalSearchTerm('')} className="ml-1 hover:text-red-500">×</button>
                                    </Badge>
                                )}
                                {localParishFilter !== 'all' && (
                                    <Badge variant="secondary" className="text-[10px] h-5">
                                        {parishes.find(p => p._id?.toString() === localParishFilter)?.parishName || localParishFilter}
                                        <button onClick={() => setLocalParishFilter('all')} className="ml-1 hover:text-red-500">×</button>
                                    </Badge>
                                )}
                                {localFundFilter !== 'all' && (
                                    <Badge variant="secondary" className="text-[10px] h-5">
                                        {funds.find(f => f._id?.toString() === localFundFilter)?.fundName || localFundFilter}
                                        <button onClick={() => setLocalFundFilter('all')} className="ml-1 hover:text-red-500">×</button>
                                    </Badge>
                                )}
                                {localPaymentMethodFilter !== 'all' && (
                                    <Badge variant="secondary" className="text-[10px] h-5">
                                        {localPaymentMethodFilter === 'offline' ? 'Tiền mặt' : 'CK'}
                                        <button onClick={() => setLocalPaymentMethodFilter('all')} className="ml-1 hover:text-red-500">×</button>
                                    </Badge>
                                )}
                                {localAmountMin && (
                                    <Badge variant="secondary" className="text-[10px] h-5">
                                        ≥{parseInt(localAmountMin).toLocaleString('vi-VN')}đ
                                        <button onClick={() => setLocalAmountMin('')} className="ml-1 hover:text-red-500">×</button>
                                    </Badge>
                                )}
                                {localAmountMax && (
                                    <Badge variant="secondary" className="text-[10px] h-5">
                                        ≤{parseInt(localAmountMax).toLocaleString('vi-VN')}đ
                                        <button onClick={() => setLocalAmountMax('')} className="ml-1 hover:text-red-500">×</button>
                                    </Badge>
                                )}
                                {localFiscalYearFilter !== 'all' && (
                                    <Badge variant="secondary" className="text-[10px] h-5">
                                        Năm {localFiscalYearFilter}
                                        <button onClick={() => setLocalFiscalYearFilter('all')} className="ml-1 hover:text-red-500">×</button>
                                    </Badge>
                                )}
                                {localFiscalPeriodFilter !== 'all' && (
                                    <Badge variant="secondary" className="text-[10px] h-5">
                                        T{localFiscalPeriodFilter}
                                        <button onClick={() => setLocalFiscalPeriodFilter('all')} className="ml-1 hover:text-red-500">×</button>
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Apply Button */}
                    <div className="border-t pt-4 mt-4 flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 text-base"
                            onClick={handleResetAndApply}
                        >
                            Đặt lại
                        </Button>
                        <Button
                            className="flex-1 h-12 text-base"
                            onClick={handleApply}
                        >
                            Áp dụng
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
