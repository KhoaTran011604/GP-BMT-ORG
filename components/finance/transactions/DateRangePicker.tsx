'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type DateRangePreset =
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

interface DateRangePickerProps {
    dateFrom: string;
    dateTo: string;
    onDateFromChange: (date: string) => void;
    onDateToChange: (date: string) => void;
    onReset?: () => void;
}

export function DateRangePicker({
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
    onReset,
}: DateRangePickerProps) {
    const [open, setOpen] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<DateRangePreset | null>(null);
    const [mode, setMode] = useState<'quick' | 'custom'>('quick');

    // Calculate date range based on preset
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
        onDateFromChange(range.from);
        onDateToChange(range.to);
        setSelectedPreset(preset);
        setOpen(false);
    };

    const applyCustomRange = () => {
        setSelectedPreset('custom');
        setOpen(false);
    };

    const clearRange = () => {
        onDateFromChange('');
        onDateToChange('');
        setSelectedPreset(null);
        if (onReset) onReset();
    };

    // Get min date (2 years ago)
    const getMinDate = () => {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        return twoYearsAgo.toISOString().split('T')[0];
    };

    // Get max date (today)
    const getMaxDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Get display text for button
    const getDisplayText = () => {
        if (!dateFrom && !dateTo) return 'Chọn khoảng thời gian';

        if (selectedPreset && selectedPreset !== 'custom') {
            const presetLabels: Record<Exclude<DateRangePreset, 'custom'>, string> = {
                today: 'Hôm nay',
                yesterday: 'Hôm qua',
                last7days: '7 ngày qua',
                last30days: '30 ngày qua',
                thisMonth: 'Tháng này',
                lastMonth: 'Tháng trước',
                thisQuarter: 'Quý này',
                lastQuarter: 'Quý trước',
                thisYear: 'Năm nay',
                lastYear: 'Năm ngoái',
            };
            return presetLabels[selectedPreset];
        }

        if (dateFrom && dateTo) {
            return `${formatDisplayDate(dateFrom)} - ${formatDisplayDate(dateTo)}`;
        }

        if (dateFrom) return `Từ ${formatDisplayDate(dateFrom)}`;
        if (dateTo) return `Đến ${formatDisplayDate(dateTo)}`;

        return 'Chọn khoảng thời gian';
    };

    const formatDisplayDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const hasActiveRange = dateFrom || dateTo;

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

    return (
        <div className="flex items-center gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={hasActiveRange ? "default" : "outline"}
                        size="sm"
                        className="gap-2 min-w-[200px] justify-start"
                    >
                        <Calendar size={16} />
                        <span className="flex-1 text-left truncate">{getDisplayText()}</span>
                        {hasActiveRange && (
                            <Badge className="ml-1 bg-white/20 text-white text-xs px-1.5 py-0 hover:bg-white/30">
                                1
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                    <Tabs value={mode} onValueChange={(v) => setMode(v as 'quick' | 'custom')} className="w-full">
                        <div className="border-b px-4 pt-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="quick">Gợi ý</TabsTrigger>
                                <TabsTrigger value="custom">Tùy chỉnh</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="quick" className="p-4 space-y-2 m-0">
                            <div className="grid grid-cols-2 gap-2">
                                {presets.map((preset) => (
                                    <Button
                                        key={preset.value}
                                        variant={selectedPreset === preset.value ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => applyPreset(preset.value)}
                                        className="justify-start"
                                    >
                                        {preset.label}
                                    </Button>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="custom" className="p-4 space-y-4 m-0">
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-600">Từ ngày</Label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => onDateFromChange(e.target.value)}
                                    min={getMinDate()}
                                    max={dateTo || getMaxDate()}
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-600">Đến ngày</Label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => onDateToChange(e.target.value)}
                                    min={dateFrom || getMinDate()}
                                    max={getMaxDate()}
                                    className="h-9"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setOpen(false)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={applyCustomRange}
                                    disabled={!dateFrom && !dateTo}
                                >
                                    Áp dụng
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </PopoverContent>
            </Popover>

            {hasActiveRange && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRange}
                    className="h-9 px-2 text-gray-500 hover:text-red-600"
                    title="Xóa bộ lọc thời gian"
                >
                    <X size={16} />
                </Button>
            )}
        </div>
    );
}
