'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCompactCurrency } from '@/lib/utils';
import { FileText, Clock, CheckCircle, XCircle, Wallet } from 'lucide-react';

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="stat-card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="text-yellow-600" size={24} />
                        </div>
                        <div>
                            <div className="stat-value text-yellow-600">{pending}</div>
                            <p className="stat-label">Chờ duyệt</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="stat-card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                        <div>
                            <div className="stat-value text-green-600">{approved}</div>
                            <p className="stat-label">Đã duyệt</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="stat-card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircle className="text-red-600" size={24} />
                        </div>
                        <div>
                            <div className="stat-value text-red-600">{rejected}</div>
                            <p className="stat-label">Từ chối</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="stat-card">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${type === 'income' ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
                            <Wallet className={type === 'income' ? 'text-green-600' : 'text-red-600'} size={24} />
                        </div>
                        <div>
                            <div className={`stat-value ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {type === 'income' ? '+' : '-'}{formatCompactCurrency(totalAmount)}
                            </div>
                            <p className="stat-label">{type === 'income' ? 'Tổng thu' : 'Tổng chi'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
