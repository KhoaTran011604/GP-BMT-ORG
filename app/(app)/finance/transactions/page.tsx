'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Transaction {
  _id: string;
  transactionId: string;
  parishId: string;
  parishName?: string;
  fundId: string;
  fundName?: string;
  amount: number;
  paymentMethod: 'online' | 'offline';
  screenshotUrl?: string;
  receiptNo?: string;
  fiscalYear: number;
  fiscalPeriod: number;
  status: 'pending' | 'verified' | 'rejected';
  submittedBy: string;
  submittedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

const statusConfig = {
  pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
  verified: { label: 'Đã xác thực', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch = !searchTerm ||
      t.parishName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fundName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.receiptNo?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    verified: transactions.filter(t => t.status === 'verified').length,
    totalAmount: transactions.filter(t => t.status === 'verified').reduce((sum, t) => sum + t.amount, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Giao dịch & Xác thực</h1>
          <p className="text-gray-600">Quản lý các giao dịch tài chính từ các Giáo xứ</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Tạo giao dịch mới</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo giao dịch mới</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Giáo xứ *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Giáo xứ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Giáo xứ Chính Tòa</SelectItem>
                      <SelectItem value="2">Giáo xứ Thánh Tâm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Loại quỹ *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại quỹ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FUND_01">Quỹ Liên hiệp Truyền giáo</SelectItem>
                      <SelectItem value="FUND_06">Quỹ Phòng thu TGM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Số tiền *</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div>
                  <Label>Phương thức</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phương thức" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Chuyển khoản</SelectItem>
                      <SelectItem value="offline">Tiền mặt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Ảnh chụp biên lai (nếu chuyển khoản)</Label>
                <Input type="file" accept="image/*" />
              </div>
              <div>
                <Label>Ghi chú</Label>
                <Input placeholder="Ghi chú thêm (nếu có)" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">Tạo giao dịch</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-sm text-gray-600">Tổng giao dịch</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-gray-600">Chờ xác thực</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            <p className="text-sm text-gray-600">Đã xác thực</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-sm text-gray-600">Tổng thu đã duyệt</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách giao dịch</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="verified">Đã duyệt</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">💰</p>
              <p>Chưa có giao dịch nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Giáo xứ</TableHead>
                  <TableHead>Loại quỹ</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx._id}>
                    <TableCell className="text-sm">{formatDate(tx.submittedAt)}</TableCell>
                    <TableCell className="font-medium">{tx.parishName || '-'}</TableCell>
                    <TableCell>{tx.fundName || tx.fundId}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(tx.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {tx.paymentMethod === 'online' ? 'Chuyển khoản' : 'Tiền mặt'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[tx.status].color}>
                        {statusConfig[tx.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Chi tiết</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
