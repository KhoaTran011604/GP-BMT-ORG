'use client';

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
import { Search, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Fund, Parish } from '@/lib/schemas';

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
}: TransactionFiltersProps) {
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
    ].filter(Boolean).length;

    const currentYear = new Date().getFullYear();
    const fiscalYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <>
            <Button
                variant={showAdvancedFilter ? "default" : "outline"}
                size="sm"
                onClick={onToggleAdvancedFilter}
                className="gap-2"
            >
                <Filter size={16} />
                Bộ lọc
                {activeFilterCount > 0 && (
                    <Badge className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0">
                        {activeFilterCount}
                    </Badge>
                )}
            </Button>

            {/* Advanced Filter Panel */}
            {showAdvancedFilter && (
                <div className="bg-gray-50 border rounded-lg p-4 space-y-4 col-span-full">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                            <Filter size={14} />
                            Bộ lọc nâng cao
                        </h4>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onResetFilters}
                                className="text-red-600 hover:text-red-700 h-7 text-xs"
                            >
                                <X size={14} className="mr-1" />
                                Xóa bộ lọc
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Tìm kiếm</Label>
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Mã GD, người nộp/nhận..."
                                    value={searchTerm}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="pl-8 h-9"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Trạng thái</Label>
                            <Select value={statusFilter} onValueChange={onStatusChange}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Tất cả trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                                    <SelectItem value="approved">Đã duyệt</SelectItem>
                                    <SelectItem value="rejected">Từ chối</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Parish Filter */}
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Giáo xứ</Label>
                            <Select value={parishFilter} onValueChange={onParishChange}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Tất cả giáo xứ" />
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
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Quỹ</Label>
                            <Select value={fundFilter} onValueChange={onFundChange}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Tất cả quỹ" />
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

                        {/* Payment Method Filter */}
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Hình thức thanh toán</Label>
                            <Select value={paymentMethodFilter} onValueChange={onPaymentMethodChange}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Tất cả hình thức" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="offline">Tiền mặt</SelectItem>
                                    <SelectItem value="online">Chuyển khoản</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Fiscal Year Filter */}
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Năm tài chính</Label>
                            <Select value={fiscalYearFilter} onValueChange={onFiscalYearChange}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Tất cả năm" />
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

                        {/* Fiscal Period Filter */}
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Kỳ tài chính</Label>
                            <Select value={fiscalPeriodFilter} onValueChange={onFiscalPeriodChange}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Tất cả kỳ" />
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
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Số tiền từ</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={amountMin}
                                onChange={(e) => onAmountMinChange(e.target.value)}
                                className="h-9"
                            />
                        </div>

                        {/* Amount Max */}
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Số tiền đến</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={amountMax}
                                onChange={(e) => onAmountMaxChange(e.target.value)}
                                className="h-9"
                            />
                        </div>
                    </div>
                    {/* Active filters summary */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                            <span className="text-xs text-gray-500">Đang lọc:</span>
                            {statusFilter !== 'all' && (
                                <Badge variant="secondary" className="text-xs">
                                    Trạng thái: {statusFilter === 'pending' ? 'Chờ duyệt' : statusFilter === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                                    <button onClick={() => onStatusChange('all')} className="ml-1 hover:text-red-500">×</button>
                                </Badge>
                            )}
                            {searchTerm && (
                                <Badge variant="secondary" className="text-xs">
                                    Tìm: "{searchTerm}"
                                    <button onClick={() => onSearchChange('')} className="ml-1 hover:text-red-500">×</button>
                                </Badge>
                            )}
                            {parishFilter !== 'all' && (
                                <Badge variant="secondary" className="text-xs">
                                    Giáo xứ: {parishes.find(p => p._id?.toString() === parishFilter)?.parishName || parishFilter}
                                    <button onClick={() => onParishChange('all')} className="ml-1 hover:text-red-500">×</button>
                                </Badge>
                            )}
                            {fundFilter !== 'all' && (
                                <Badge variant="secondary" className="text-xs">
                                    Quỹ: {funds.find(f => f._id?.toString() === fundFilter)?.fundName || fundFilter}
                                    <button onClick={() => onFundChange('all')} className="ml-1 hover:text-red-500">×</button>
                                </Badge>
                            )}
                            {paymentMethodFilter !== 'all' && (
                                <Badge variant="secondary" className="text-xs">
                                    Hình thức: {paymentMethodFilter === 'offline' ? 'Tiền mặt' : 'Chuyển khoản'}
                                    <button onClick={() => onPaymentMethodChange('all')} className="ml-1 hover:text-red-500">×</button>
                                </Badge>
                            )}
                            {amountMin && (
                                <Badge variant="secondary" className="text-xs">
                                    Từ: {parseInt(amountMin).toLocaleString('vi-VN')}đ
                                    <button onClick={() => onAmountMinChange('')} className="ml-1 hover:text-red-500">×</button>
                                </Badge>
                            )}
                            {amountMax && (
                                <Badge variant="secondary" className="text-xs">
                                    Đến: {parseInt(amountMax).toLocaleString('vi-VN')}đ
                                    <button onClick={() => onAmountMaxChange('')} className="ml-1 hover:text-red-500">×</button>
                                </Badge>
                            )}
                            {fiscalYearFilter !== 'all' && (
                                <Badge variant="secondary" className="text-xs">
                                    Năm: {fiscalYearFilter}
                                    <button onClick={() => onFiscalYearChange('all')} className="ml-1 hover:text-red-500">×</button>
                                </Badge>
                            )}
                            {fiscalPeriodFilter !== 'all' && (
                                <Badge variant="secondary" className="text-xs">
                                    Tháng: {fiscalPeriodFilter}
                                    <button onClick={() => onFiscalPeriodChange('all')} className="ml-1 hover:text-red-500">×</button>
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
