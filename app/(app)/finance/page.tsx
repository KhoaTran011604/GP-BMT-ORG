'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { formatCompactCurrency } from '@/lib/utils';
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Fund {
  _id: string;
  fundCode: string;
  fundName: string;
  category: string;
  recipientUnit: string;
}

interface Transaction {
  _id: string;
  parishId: string;
  fundId: string;
  amount: number;
  status: string;
  submittedAt: string;
  receiptNo?: string;
}

interface Parish {
  _id: string;
  parishName: string;
}

export default function FinancePage() {
  const { user } = useAuth();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [parishes, setParishes] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    parishId: '',
    fundId: '',
    amount: '',
    receiptNo: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Set default parishId from user
  useEffect(() => {
    if (user?.parishId) {
      setFormData(prev => ({ ...prev, parishId: user.parishId! }));
    }
  }, [user?.parishId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fundsRes, transactionsRes, parishesRes] = await Promise.all([
        fetch('/api/funds'),
        fetch('/api/transactions'),
        fetch('/api/parishes'),
      ]);

      if (fundsRes.ok) {
        const data = await fundsRes.json();
        setFunds(data.data || []);
      }

      if (transactionsRes.ok) {
        const data = await transactionsRes.json();
        setTransactions(data.data || []);
      }

      if (parishesRes.ok) {
        const data = await parishesRes.json();
        const parishMap: { [key: string]: string } = {};
        data.data?.forEach((p: Parish) => {
          parishMap[p._id] = p.parishName;
        });
        setParishes(parishMap);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (response.ok) {
        setShowDialog(false);
        setFormData({
          parishId: user?.parishId || '',
          fundId: '',
          amount: '',
          receiptNo: '',
          notes: '',
        });
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Error creating transaction');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Error creating transaction');
    }
  };

  const canCreateTransaction = ['cha_xu', 'thu_ky', 'super_admin'].includes(user?.role || '');
  const canVerify = ['super_admin', 'cha_quan_ly'].includes(user?.role || '');

  const filteredTransactions = transactions.filter(
    (t) => filterStatus === 'all' || t.status === filterStatus
  );

  // Calculate stats
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = transactions
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);
  const verifiedAmount = transactions
    .filter((t) => t.status === 'verified')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Tài chính</h1>
          <p className="text-gray-600">Quản lý các quỹ và giao dịch tài chính</p>
        </div>
        {canCreateTransaction && (
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus size={20} />
            Nhập giao dịch
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">Tổng thu</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatCompactCurrency(totalAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">Chờ duyệt</p>
            <p className="text-3xl font-bold text-yellow-600">
              {formatCompactCurrency(pendingAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-2">Đã xác thực</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCompactCurrency(verifiedAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="pending">Chờ duyệt</SelectItem>
            <SelectItem value="verified">Đã xác thực</SelectItem>
            <SelectItem value="rejected">Bị từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách giao dịch</CardTitle>
          <CardDescription>
            Tổng cộng {filteredTransactions.length} giao dịch
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Giáo xứ</th>
                    <th className="text-left py-3 px-4 font-semibold">Quỹ</th>
                    <th className="text-right py-3 px-4 font-semibold">Số tiền</th>
                    <th className="text-left py-3 px-4 font-semibold">Ngày nộp</th>
                    <th className="text-left py-3 px-4 font-semibold">Trạng thái</th>
                    {canVerify && <th className="text-left py-3 px-4 font-semibold">Hành động</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => {
                    const fund = funds.find((f) => f._id === transaction.fundId);
                    const parishName = parishes[transaction.parishId] || 'N/A';

                    return (
                      <tr key={transaction._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{parishName}</td>
                        <td className="py-3 px-4">{fund?.fundName || 'N/A'}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          {transaction.amount.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(transaction.submittedAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {transaction.status === 'pending' && (
                              <>
                                <Clock size={16} className="text-yellow-600" />
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                                  Chờ duyệt
                                </span>
                              </>
                            )}
                            {transaction.status === 'verified' && (
                              <>
                                <CheckCircle size={16} className="text-green-600" />
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                  Đã xác thực
                                </span>
                              </>
                            )}
                            {transaction.status === 'rejected' && (
                              <>
                                <XCircle size={16} className="text-red-600" />
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                  Bị từ chối
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        {canVerify && (
                          <td className="py-3 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // TODO: Add verification logic
                                alert('Chức năng xác thực sẽ được triển khai');
                              }}
                              disabled={transaction.status !== 'pending'}
                            >
                              Xác thực
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập giao dịch tài chính</DialogTitle>
            <DialogDescription>
              Ghi nhận giao dịch tài chính cho các quỹ
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Giáo xứ *</label>
              <Select value={formData.parishId} onValueChange={(value) =>
                setFormData({ ...formData, parishId: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn Giáo xứ" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(parishes).map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quỹ *</label>
              <Select value={formData.fundId} onValueChange={(value) =>
                setFormData({ ...formData, fundId: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn Quỹ" />
                </SelectTrigger>
                <SelectContent>
                  {funds.map((fund) => (
                    <SelectItem key={fund._id} value={fund._id}>
                      {fund.fundName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Số tiền *</label>
              <Input
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Số phiếu thu</label>
              <Input
                placeholder="VD: THU-001"
                value={formData.receiptNo}
                onChange={(e) => setFormData({ ...formData, receiptNo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ghi chú</label>
              <Input
                placeholder="Thêm ghi chú nếu cần"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button type="submit" className="flex-1">
                Nhập giao dịch
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
