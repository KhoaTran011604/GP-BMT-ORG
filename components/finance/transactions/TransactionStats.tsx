'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCompactCurrency } from '@/lib/utils';

interface TransactionStatsProps {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalAmount: number;
    type: 'income' | 'expense';
}

export function TransactionStats({
    total,
    pending,
    approved,
    rejected,
    totalAmount,
    type,
}: TransactionStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Tổng số</CardDescription>
                    <CardTitle>{total}</CardTitle>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Chờ duyệt</CardDescription>
                    <CardTitle className="text-yellow-600">{pending}</CardTitle>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Đã duyệt</CardDescription>
                    <CardTitle className="text-green-600">{approved}</CardTitle>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Từ chối</CardDescription>
                    <CardTitle className="text-red-600">{rejected}</CardTitle>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>{type === 'income' ? 'Tổng thu' : 'Tổng chi'}</CardDescription>
                    <CardTitle className={type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {type === 'income' ? '+' : '-'}{formatCompactCurrency(totalAmount)}
                    </CardTitle>
                </CardHeader>
            </Card>
        </div>
    );
}
