'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Eye, ArrowDownCircle, ArrowUpCircle, FileText } from 'lucide-react';
import { ImageGallery } from '@/components/finance/ImageGallery';

interface PendingItem {
  _id: string;
  type: 'income' | 'expense';
  code: string;
  parishId: string;
  parishName?: string;
  fundId?: string;
  fundName?: string;
  categoryId?: string;
  amount: number;
  paymentMethod: string;
  bankAccount?: string;
  payerPayee: string;
  description?: string;
  images: string[];
  submittedAt: string;
  transactionDate: string;
  notes?: string;
  fiscalYear?: number;
  fiscalPeriod?: number;
}

export default function ReconciliationPage() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState('all');

  const [showGallery, setShowGallery] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedForView, setSelectedForView] = useState<PendingItem | null>(null);
  const [selectedForReject, setSelectedForReject] = useState<PendingItem | null>(null);
  const [selectedForDetail, setSelectedForDetail] = useState<PendingItem | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingItems();
  }, [selectedPeriod, typeFilter]);

  const fetchPendingItems = async () => {
    setLoading(true);
    try {
      const [incomesRes, expensesRes] = await Promise.all([
        fetch('/api/incomes?status=pending'),
        fetch('/api/expenses?status=pending')
      ]);

      const allItems: PendingItem[] = [];

      if (incomesRes.ok) {
        const incomesData = await incomesRes.json();
        const incomes = (incomesData.data || []).map((item: any) => ({
          _id: item._id,
          type: 'income' as const,
          code: item.incomeCode,
          parishId: item.parishId,
          fundId: item.fundId,
          amount: item.amount,
          paymentMethod: item.paymentMethod,
          bankAccount: item.bankAccount,
          payerPayee: item.payerName || '',
          description: item.description,
          images: item.images || [],
          submittedAt: item.submittedAt,
          transactionDate: item.incomeDate,
          notes: item.notes,
          fiscalYear: item.fiscalYear,
          fiscalPeriod: item.fiscalPeriod
        }));
        allItems.push(...incomes);
      }

      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        const expenses = (expensesData.data || []).map((item: any) => ({
          _id: item._id,
          type: 'expense' as const,
          code: item.expenseCode,
          parishId: item.parishId,
          fundId: item.fundId,
          categoryId: item.categoryId,
          amount: item.amount,
          paymentMethod: item.paymentMethod,
          bankAccount: item.bankAccount,
          payerPayee: item.payeeName || '',
          description: item.description,
          images: item.images || [],
          submittedAt: item.requestedAt,
          transactionDate: item.expenseDate,
          notes: item.notes,
          fiscalYear: item.fiscalYear,
          fiscalPeriod: item.fiscalPeriod
        }));
        allItems.push(...expenses);
      }

      allItems.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      let filteredItems = allItems;
      if (typeFilter !== 'all') {
        filteredItems = allItems.filter(item => item.type === typeFilter);
      }

      setItems(filteredItems);
    } catch (error) {
      console.error('Error fetching pending items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item: PendingItem) => {
    setProcessing(true);
    try {
      const endpoint = item.type === 'income'
        ? `/api/incomes/${item._id}`
        : `/api/expenses/${item._id}`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Đã duyệt thành công! Số phiếu: ${result.data.receipt?.receiptNo || 'N/A'}`);
        fetchPendingItems();
        setSelectedItems(prev => prev.filter(id => id !== item._id));
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể duyệt'}`);
      }
    } catch (error) {
      console.error('Error approving:', error);
      alert('Không thể duyệt giao dịch');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedForReject) return;

    setProcessing(true);
    try {
      const endpoint = selectedForReject.type === 'income'
        ? `/api/incomes/${selectedForReject._id}`
        : `/api/expenses/${selectedForReject._id}`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          notes: rejectNote || undefined
        })
      });

      if (response.ok) {
        alert('Đã từ chối giao dịch');
        setShowRejectDialog(false);
        setSelectedForReject(null);
        setRejectNote('');
        fetchPendingItems();
        setSelectedItems(prev => prev.filter(id => id !== selectedForReject._id));
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể từ chối'}`);
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Không thể từ chối giao dịch');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedItems.length === 0) return;
    if (!confirm(`Bạn có chắc muốn duyệt ${selectedItems.length} giao dịch?`)) return;

    setProcessing(true);
    let successCount = 0;

    for (const id of selectedItems) {
      const item = items.find(i => i._id === id);
      if (!item) continue;

      try {
        const endpoint = item.type === 'income'
          ? `/api/incomes/${id}`
          : `/api/expenses/${id}`;

        const response = await fetch(endpoint, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' })
        });

        if (response.ok) successCount++;
      } catch (error) {
        console.error(`Error approving ${id}:`, error);
      }
    }

    alert(`Đã duyệt thành công ${successCount}/${selectedItems.length} giao dịch`);
    setSelectedItems([]);
    fetchPendingItems();
    setProcessing(false);
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
      setSelectedItems(items.map(t => t._id));
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

  const totalPending = items.reduce((sum, t) => sum + t.amount, 0);
  const totalSelected = items
    .filter(t => selectedItems.includes(t._id))
    .reduce((sum, t) => sum + t.amount, 0);

  const incomeCount = items.filter(i => i.type === 'income').length;
  const expenseCount = items.filter(i => i.type === 'expense').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Duyệt Giao dịch</h1>
          <p className="text-gray-500">Xác thực và duyệt các khoản thu chi từ Giáo xứ</p>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="income">Chỉ Thu</SelectItem>
            <SelectItem value="expense">Chỉ Chi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle>Quy trình Duyệt giao dịch</CardTitle>
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
              <p className="mt-2 text-center">Upload ảnh<br/>chứng từ</p>
            </div>
            <div className="flex-1 h-1 bg-blue-200 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold">3</div>
              <p className="mt-2 text-center">Cha Quản lý<br/>đối chiếu</p>
            </div>
            <div className="flex-1 h-1 bg-blue-200 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">4</div>
              <p className="mt-2 text-center">Phê duyệt →<br/>Tự động tạo phiếu</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{items.length}</div>
            <p className="text-sm text-gray-600">Chờ duyệt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowDownCircle size={20} className="text-green-600" />
              <span className="text-2xl font-bold text-green-600">{incomeCount}</span>
            </div>
            <p className="text-sm text-gray-600">Khoản thu</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowUpCircle size={20} className="text-red-600" />
              <span className="text-2xl font-bold text-red-600">{expenseCount}</span>
            </div>
            <p className="text-sm text-gray-600">Khoản chi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalPending)}</div>
            <p className="text-sm text-gray-600">Tổng tiền chờ duyệt</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Giao dịch chờ duyệt</CardTitle>
              <CardDescription>
                Chọn các giao dịch để phê duyệt hoặc từ chối. Đã chọn: {selectedItems.length} ({formatCurrency(totalSelected)})
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedItems.length === 0) {
                    alert('Vui lòng chọn ít nhất 1 giao dịch');
                    return;
                  }
                  alert('Vui lòng từ chối từng giao dịch để nhập lý do');
                }}
                disabled={selectedItems.length === 0 || processing}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle size={16} className="mr-2" />
                Từ chối
              </Button>
              <Button
                onClick={handleBulkApprove}
                disabled={selectedItems.length === 0 || processing}
              >
                <CheckCircle size={16} className="mr-2" />
                Duyệt ({selectedItems.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
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
                      checked={selectedItems.length === items.length && items.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Mã</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>{typeFilter === 'expense' ? 'Người nhận' : 'Người nộp/nhận'}</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>Ảnh</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id} className={selectedItems.includes(item._id) ? 'bg-blue-50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item._id)}
                        onCheckedChange={(checked) => handleSelectItem(item._id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={item.type === 'income'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                        }
                      >
                        {item.type === 'income' ? (
                          <><ArrowDownCircle size={12} className="mr-1" /> Thu</>
                        ) : (
                          <><ArrowUpCircle size={12} className="mr-1" /> Chi</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.code}</TableCell>
                    <TableCell>{formatDate(item.submittedAt)}</TableCell>
                    <TableCell>{item.payerPayee || 'N/A'}</TableCell>
                    <TableCell className={`text-right font-semibold ${
                      item.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.type === 'expense' ? '-' : ''}{formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell>
                      {item.images.length > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedForView(item);
                            setShowGallery(true);
                          }}
                        >
                          <Eye size={16} className="mr-1" />
                          {item.images.length}
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedForDetail(item);
                            setShowDetailDialog(true);
                          }}
                          title="Chi tiết"
                        >
                          <FileText size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleApprove(item)}
                          disabled={processing}
                          title="Duyệt"
                        >
                          <CheckCircle size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedForReject(item);
                            setRejectNote('');
                            setShowRejectDialog(true);
                          }}
                          disabled={processing}
                          title="Từ chối"
                        >
                          <XCircle size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedForView && (
        <ImageGallery
          images={selectedForView.images}
          open={showGallery}
          onClose={() => {
            setShowGallery(false);
            setSelectedForView(null);
          }}
        />
      )}

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối giao dịch</DialogTitle>
            <DialogDescription>
              Giao dịch: {selectedForReject?.code}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Số tiền</p>
              <p className="font-semibold">
                {selectedForReject && formatCurrency(selectedForReject.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Lý do từ chối (tùy chọn)</p>
              <Textarea
                placeholder="Nhập lý do từ chối..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setSelectedForReject(null);
                setRejectNote('');
              }}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing}
            >
              {processing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedForDetail?.type === 'income' ? (
                <Badge className="bg-green-100 text-green-700">
                  <ArrowDownCircle size={14} className="mr-1" /> Khoản Thu
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700">
                  <ArrowUpCircle size={14} className="mr-1" /> Khoản Chi
                </Badge>
              )}
              Chi tiết giao dịch
            </DialogTitle>
            <DialogDescription>
              Mã: {selectedForDetail?.code}
            </DialogDescription>
          </DialogHeader>

          {selectedForDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Ngày {selectedForDetail.type === 'income' ? 'thu' : 'chi'}</p>
                  <p className="font-medium">{formatDate(selectedForDetail.transactionDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Ngày tạo</p>
                  <p className="font-medium">{formatDate(selectedForDetail.submittedAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Số tiền</p>
                  <p className={`text-xl font-bold ${selectedForDetail.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedForDetail.type === 'expense' ? '-' : ''}{formatCurrency(selectedForDetail.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Hình thức thanh toán</p>
                  <p className="font-medium capitalize">{selectedForDetail.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {selectedForDetail.type === 'income' ? 'Người nộp' : 'Người nhận'}
                  </p>
                  <p className="font-medium">{selectedForDetail.payerPayee || 'N/A'}</p>
                </div>
                {selectedForDetail.bankAccount && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tài khoản ngân hàng</p>
                    <p className="font-medium">{selectedForDetail.bankAccount}</p>
                  </div>
                )}
                {selectedForDetail.fiscalYear && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Năm tài chính</p>
                    <p className="font-medium">{selectedForDetail.fiscalYear}</p>
                  </div>
                )}
                {selectedForDetail.fiscalPeriod && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Kỳ tài chính</p>
                    <p className="font-medium">Tháng {selectedForDetail.fiscalPeriod}</p>
                  </div>
                )}
              </div>

              {selectedForDetail.description && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Diễn giải</p>
                  <p className="font-medium bg-gray-50 p-3 rounded-md">{selectedForDetail.description}</p>
                </div>
              )}

              {selectedForDetail.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Ghi chú</p>
                  <p className="font-medium bg-gray-50 p-3 rounded-md">{selectedForDetail.notes}</p>
                </div>
              )}

              {selectedForDetail.images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Hình ảnh chứng từ ({selectedForDetail.images.length})</p>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedForDetail.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Chứng từ ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setSelectedForView(selectedForDetail);
                          setShowGallery(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDetailDialog(false);
                setSelectedForDetail(null);
              }}
            >
              Đóng
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                setShowDetailDialog(false);
                setSelectedForReject(selectedForDetail);
                setRejectNote('');
                setShowRejectDialog(true);
              }}
              disabled={processing}
            >
              <XCircle size={16} className="mr-2" />
              Từ chối
            </Button>
            <Button
              onClick={() => {
                if (selectedForDetail) {
                  handleApprove(selectedForDetail);
                  setShowDetailDialog(false);
                  setSelectedForDetail(null);
                }
              }}
              disabled={processing}
            >
              <CheckCircle size={16} className="mr-2" />
              Duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
