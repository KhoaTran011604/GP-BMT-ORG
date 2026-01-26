'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Eye, Printer, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Receipt {
  _id: string;
  receiptNo: string;
  receiptType: 'income' | 'expense';
  referenceId?: string;
  parishId: string;
  amount: number;
  receiptDate: string;
  payerPayee: string;
  description?: string;
  createdAt: string;
  status?: 'active' | 'cancelled';
}

export default function ReceiptsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Cancel dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/receipts');
      if (res.ok) {
        const data = await res.json();
        setReceipts(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const filteredReceipts = receipts.filter(r => {
    const matchesType = typeFilter === 'all' || r.receiptType === typeFilter;
    const matchesSearch = !searchTerm ||
      r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.payerPayee || '').toLowerCase().includes(searchTerm.toLowerCase());
    const notCancelled = r.status !== 'cancelled';
    return matchesType && matchesSearch && notCancelled;
  });

  const handleOpenCancelDialog = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setCancelDialogOpen(true);
  };

  const handleCancelReceipt = async () => {
    if (!selectedReceipt) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/receipts/${selectedReceipt._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Đã huỷ phiếu thành công!');
        setCancelDialogOpen(false);
        setSelectedReceipt(null);
        fetchReceipts();
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.error || 'Không thể huỷ phiếu'}`);
      }
    } catch (error) {
      console.error('Error cancelling receipt:', error);
      alert('Lỗi khi huỷ phiếu');
    } finally {
      setCancelling(false);
    }
  };

  const incomeReceipts = receipts.filter(r => r.receiptType === 'income' && r.status !== 'cancelled');
  const expenseReceipts = receipts.filter(r => r.receiptType === 'expense' && r.status !== 'cancelled');
  const totalIncome = incomeReceipts.reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = expenseReceipts.reduce((sum, r) => sum + r.amount, 0);

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
          <h1 className="text-2xl font-bold">Phiếu thu chi</h1>
          <p className="text-gray-600">Quản lý phiếu thu và phiếu chi</p>
        </div>
        <Button variant="outline">Xuất danh sách</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{receipts.filter(r => r.status !== 'cancelled').length}</div>
            <p className="text-sm text-gray-600">Tổng phiếu</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{incomeReceipts.length}</div>
            <p className="text-sm text-gray-600">Phiếu thu</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{expenseReceipts.length}</div>
            <p className="text-sm text-gray-600">Phiếu chi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalIncome - totalExpense)}</div>
            <p className="text-sm text-gray-600">Chênh lệch</p>
          </CardContent>
        </Card>
      </div>

      {/* Receipt List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách Phiếu ({filteredReceipts.length})</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Tìm số phiếu, người nộp/nhận..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="income">Phiếu thu</SelectItem>
                  <SelectItem value="expense">Phiếu chi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">🧾</p>
              <p>Chưa có phiếu nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Số phiếu</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Ngày lập</TableHead>
                  <TableHead>Người nộp/nhận</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.map((receipt) => (
                  <TableRow key={receipt._id}>
                    <TableCell className="font-mono font-medium">{receipt.receiptNo}</TableCell>
                    <TableCell>
                      <Badge className={
                        receipt.receiptType === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }>
                        {receipt.receiptType === 'income' ? 'Thu' : 'Chi'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(receipt.receiptDate)}</TableCell>
                    <TableCell>{receipt.payerPayee || '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{receipt.description || '-'}</TableCell>
                    <TableCell className={`text-right font-medium ${receipt.receiptType === 'income' ? 'text-green-600' : 'text-orange-600'}`}>
                      {receipt.receiptType === 'income' ? '+' : '-'}{formatCurrency(receipt.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/finance/receipts/${receipt._id}`)}
                        >
                          <Eye size={14} className="mr-1" />
                          Xem
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/finance/receipts/${receipt._id}`)}
                        >
                          <Printer size={14} className="mr-1" />
                          In
                        </Button>
                        {/* Cancel button - ONLY for super_admin */}
                        {isSuperAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleOpenCancelDialog(receipt)}
                          >
                            <XCircle size={14} className="mr-1" />
                            Huỷ
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Receipt Template Preview */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>Mẫu Phiếu thu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-6 border rounded-lg max-w-md mx-auto">
            <div className="text-center mb-4">
              <h3 className="font-bold">TOÀ GIÁM MỤC BUÔN MA THUỘT</h3>
              <p className="text-sm text-gray-600">Giáo phận Buôn Ma Thuột</p>
            </div>
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">PHIẾU THU</h2>
              <p className="text-sm">Số: PT-2024-XXXX</p>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Ngày:</strong> __/__/____</p>
              <p><strong>Đơn vị nộp:</strong> _________________</p>
              <p><strong>Nội dung:</strong> _________________</p>
              <p><strong>Số tiền:</strong> _________________</p>
              <p><strong>Bằng chữ:</strong> _________________</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6 text-center text-sm">
              <div>
                <p className="font-medium">Người nộp tiền</p>
                <p className="text-gray-500">(Ký, ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="font-medium">Người lập phiếu</p>
                <p className="text-gray-500">(Ký, ghi rõ họ tên)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Xác nhận huỷ phiếu</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Bạn có chắc chắn muốn huỷ phiếu này?</p>
                {selectedReceipt && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Số phiếu</p>
                    <p className="font-mono font-semibold">{selectedReceipt.receiptNo}</p>
                    <p className="text-sm text-gray-600 mt-2">Số tiền</p>
                    <p className="font-semibold">{formatCurrency(selectedReceipt.amount)}</p>
                  </div>
                )}
                <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-800">
                  <p className="font-medium">Lưu ý:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Hành động này không thể hoàn tác</li>
                    <li>Giao dịch liên quan sẽ được đưa về trạng thái chờ duyệt</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Đóng</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelReceipt}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelling ? 'Đang xử lý...' : 'Xác nhận huỷ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
