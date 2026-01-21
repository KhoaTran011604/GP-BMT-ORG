'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Receipt {
  _id: string;
  receiptNo: string;
  transactionId: string;
  parishName: string;
  fundName: string;
  amount: number;
  issuedAt: string;
  issuedBy: string;
  status: 'draft' | 'issued' | 'cancelled';
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const res = await fetch('/api/receipts');
      if (res.ok) {
        const data = await res.json();
        setReceipts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
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

  const filteredReceipts = receipts.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch = !searchTerm ||
      r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.parishName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handlePrint = (receiptId: string) => {
    // TODO: Implement print functionality
    alert(`In phiếu thu: ${receiptId}`);
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
          <h1 className="text-2xl font-bold">Phiếu thu</h1>
          <p className="text-gray-600">Quản lý và in phiếu thu cho các giao dịch</p>
        </div>
        <Button variant="outline">Xuất danh sách</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{receipts.length}</div>
            <p className="text-sm text-gray-600">Tổng phiếu thu</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {receipts.filter(r => r.status === 'issued').length}
            </div>
            <p className="text-sm text-gray-600">Đã phát hành</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {receipts.filter(r => r.status === 'draft').length}
            </div>
            <p className="text-sm text-gray-600">Bản nháp</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(receipts.filter(r => r.status === 'issued').reduce((sum, r) => sum + r.amount, 0))}
            </div>
            <p className="text-sm text-gray-600">Tổng thu đã phát hành</p>
          </CardContent>
        </Card>
      </div>

      {/* Receipt List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách Phiếu thu ({filteredReceipts.length})</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Tìm số phiếu, giáo xứ..."
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
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="issued">Đã phát hành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">🧾</p>
              <p>Chưa có phiếu thu nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Số phiếu</TableHead>
                  <TableHead>Ngày lập</TableHead>
                  <TableHead>Giáo xứ</TableHead>
                  <TableHead>Loại quỹ</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>Người lập</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.map((receipt) => (
                  <TableRow key={receipt._id}>
                    <TableCell className="font-mono font-medium">{receipt.receiptNo}</TableCell>
                    <TableCell>{formatDate(receipt.issuedAt)}</TableCell>
                    <TableCell>{receipt.parishName}</TableCell>
                    <TableCell>{receipt.fundName}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(receipt.amount)}</TableCell>
                    <TableCell>{receipt.issuedBy}</TableCell>
                    <TableCell>
                      <Badge className={
                        receipt.status === 'issued' ? 'bg-green-100 text-green-800' :
                        receipt.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {receipt.status === 'issued' ? 'Đã phát hành' :
                         receipt.status === 'draft' ? 'Bản nháp' : 'Đã hủy'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">Xem</Button>
                        {receipt.status === 'issued' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrint(receipt._id)}
                          >
                            In
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
    </div>
  );
}
