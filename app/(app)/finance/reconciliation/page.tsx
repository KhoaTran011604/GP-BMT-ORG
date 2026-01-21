'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface Transaction {
  _id: string;
  parishName: string;
  fundName: string;
  amount: number;
  paymentMethod: string;
  screenshotUrl?: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
}

export default function ReconciliationPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    fetchPendingTransactions();
  }, [selectedPeriod]);

  const fetchPendingTransactions = async () => {
    try {
      const res = await fetch(`/api/transactions?status=pending&period=${selectedPeriod}`);
      if (res.ok) {
        const result = await res.json();
        const transactions = result.data || [];
        setTransactions(transactions.filter((t: Transaction) => t.status === 'pending'));
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
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(transactions.map(t => t._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(i => i !== id));
    }
  };

  const handleApprove = async () => {
    if (selectedItems.length === 0) return;
    // TODO: Implement bulk approve
    alert(`Đã chọn ${selectedItems.length} giao dịch để phê duyệt`);
  };

  const handleReject = async () => {
    if (selectedItems.length === 0) return;
    // TODO: Implement bulk reject
    alert(`Đã chọn ${selectedItems.length} giao dịch để từ chối`);
  };

  const totalSelected = transactions
    .filter(t => selectedItems.includes(t._id))
    .reduce((sum, t) => sum + t.amount, 0);

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
          <h1 className="text-2xl font-bold">Đối soát (Audit)</h1>
          <p className="text-gray-600">Xác thực và đối soát các giao dịch từ Giáo xứ</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024-01">Tháng 1/2024</SelectItem>
            <SelectItem value="2024-02">Tháng 2/2024</SelectItem>
            <SelectItem value="2024-03">Tháng 3/2024</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Workflow Diagram */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle>Quy trình Xác thực</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
              <p className="mt-2 text-center">Cha xứ/Thư ký<br/>tạo giao dịch</p>
            </div>
            <div className="flex-1 h-1 bg-blue-200 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">2</div>
              <p className="mt-2 text-center">Upload ảnh<br/>biên lai</p>
            </div>
            <div className="flex-1 h-1 bg-blue-200 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold">3</div>
              <p className="mt-2 text-center">Cha Quản lý<br/>đối chiếu</p>
            </div>
            <div className="flex-1 h-1 bg-blue-200 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">4</div>
              <p className="mt-2 text-center">Phê duyệt/<br/>Từ chối</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{transactions.length}</div>
            <p className="text-sm text-gray-600">Giao dịch chờ duyệt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{selectedItems.length}</div>
            <p className="text-sm text-gray-600">Đã chọn</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSelected)}</div>
            <p className="text-sm text-gray-600">Tổng tiền đã chọn</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Giao dịch chờ xác thực</CardTitle>
              <CardDescription>Chọn các giao dịch để phê duyệt hoặc từ chối</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={selectedItems.length === 0}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Từ chối ({selectedItems.length})
              </Button>
              <Button
                onClick={handleApprove}
                disabled={selectedItems.length === 0}
              >
                Phê duyệt ({selectedItems.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">✅</p>
              <p>Không có giao dịch nào chờ duyệt</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === transactions.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Ngày nộp</TableHead>
                  <TableHead>Giáo xứ</TableHead>
                  <TableHead>Loại quỹ</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Biên lai</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx._id} className={selectedItems.includes(tx._id) ? 'bg-blue-50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(tx._id)}
                        onCheckedChange={(checked) => handleSelectItem(tx._id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>{formatDate(tx.submittedAt)}</TableCell>
                    <TableCell className="font-medium">{tx.parishName}</TableCell>
                    <TableCell>{tx.fundName}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(tx.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {tx.paymentMethod === 'online' ? 'Chuyển khoản' : 'Tiền mặt'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tx.screenshotUrl ? (
                        <Button variant="ghost" size="sm">Xem ảnh</Button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
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
