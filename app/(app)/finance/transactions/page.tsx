'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Eye, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { ImageUpload } from '@/components/finance/ImageUpload';
import { ImageGallery } from '@/components/finance/ImageGallery';
import { StatusBadge } from '@/components/finance/StatusBadge';
import { Income, Expense, Fund, Parish, ExpenseCategory } from '@/lib/schemas';

type TransactionType = 'income' | 'expense';

interface TransactionItem {
  _id: string;
  type: TransactionType;
  code: string;
  date: Date;
  amount: number;
  payerPayee: string;
  paymentMethod: string;
  status: 'pending' | 'approved' | 'rejected';
  images: string[];
  description?: string;
  notes?: string;
  parishId?: string;
  fundId?: string;
}

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<TransactionType>('income');
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TransactionItem | null>(null);
  const [createType, setCreateType] = useState<TransactionType>('income');

  const [formData, setFormData] = useState({
    parishId: '',
    fundId: '',
    categoryId: '',
    amount: '',
    paymentMethod: 'offline',
    bankAccount: '',
    payerPayeeName: '',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
    images: [] as string[],
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter]);

  useEffect(() => {
    fetchFundsAndParishes();
  }, []);

  const fetchFundsAndParishes = async () => {
    try {
      const [fundsRes, parishesRes, categoriesRes] = await Promise.all([
        fetch('/api/funds'),
        fetch('/api/parishes'),
        fetch('/api/expense-categories?isActive=true')
      ]);

      if (fundsRes.ok) {
        const fundsData = await fundsRes.json();
        setFunds(fundsData.data || fundsData || []);
      }

      if (parishesRes.ok) {
        const parishesData = await parishesRes.json();
        setParishes(parishesData.data || parishesData || []);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setExpenseCategories(categoriesData.data || []);
      }
    } catch (error) {
      console.error('Error fetching funds/parishes/categories:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'income' ? '/api/incomes' : '/api/expenses';
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`${endpoint}?${params}`);
      if (response.ok) {
        const result = await response.json();
        const items = (result.data || []).map((item: any) => ({
          _id: item._id,
          type: activeTab,
          code: activeTab === 'income' ? item.incomeCode : item.expenseCode,
          date: activeTab === 'income' ? item.incomeDate : item.expenseDate,
          amount: item.amount,
          payerPayee: activeTab === 'income' ? item.payerName : item.payeeName,
          paymentMethod: item.paymentMethod,
          status: item.status,
          images: item.images || [],
          description: item.description,
          notes: item.notes,
          parishId: item.parishId,
          fundId: item.fundId
        }));
        setTransactions(items);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      parishId: '',
      fundId: '',
      categoryId: '',
      amount: '',
      paymentMethod: 'offline',
      bankAccount: '',
      payerPayeeName: '',
      description: '',
      transactionDate: new Date().toISOString().split('T')[0],
      images: [],
      notes: ''
    });
  };

  const handleCreate = async () => {
    if (!formData.parishId || !formData.amount || !formData.transactionDate) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (createType === 'income' && !formData.fundId) {
      alert('Vui lòng chọn quỹ');
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = createType === 'income' ? '/api/incomes' : '/api/expenses';
      const body = createType === 'income' ? {
        parishId: formData.parishId,
        fundId: formData.fundId,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        bankAccount: formData.bankAccount || undefined,
        payerName: formData.payerPayeeName || undefined,
        description: formData.description || undefined,
        incomeDate: formData.transactionDate,
        images: formData.images,
        notes: formData.notes || undefined
      } : {
        parishId: formData.parishId,
        categoryId: formData.categoryId || undefined,
        fundId: formData.fundId || undefined,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod === 'offline' ? 'cash' : 'transfer',
        bankAccount: formData.bankAccount || undefined,
        payeeName: formData.payerPayeeName || undefined,
        description: formData.description || undefined,
        expenseDate: formData.transactionDate,
        images: formData.images,
        notes: formData.notes || undefined
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setShowCreateDialog(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể tạo giao dịch'}`);
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Không thể tạo giao dịch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem || !formData.amount) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = selectedItem.type === 'income'
        ? `/api/incomes/${selectedItem._id}`
        : `/api/expenses/${selectedItem._id}`;

      const body = selectedItem.type === 'income' ? {
        amount: parseFloat(formData.amount),
        payerName: formData.payerPayeeName || undefined,
        description: formData.description || undefined,
        images: formData.images,
        notes: formData.notes || undefined
      } : {
        amount: parseFloat(formData.amount),
        payeeName: formData.payerPayeeName || undefined,
        description: formData.description || undefined,
        images: formData.images,
        notes: formData.notes || undefined
      };

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setShowEditDialog(false);
        setSelectedItem(null);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể cập nhật'}`);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Không thể cập nhật giao dịch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: TransactionItem) => {
    if (item.status !== 'pending') {
      alert('Chỉ có thể xóa giao dịch đang chờ duyệt');
      return;
    }

    if (!confirm('Bạn có chắc muốn xóa giao dịch này?')) return;

    try {
      const endpoint = item.type === 'income'
        ? `/api/incomes/${item._id}`
        : `/api/expenses/${item._id}`;

      const response = await fetch(endpoint, { method: 'DELETE' });

      if (response.ok) {
        fetchData();
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể xóa'}`);
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Không thể xóa giao dịch');
    }
  };

  const openEditDialog = (item: TransactionItem) => {
    setSelectedItem(item);
    setFormData({
      parishId: item.parishId || '',
      fundId: item.fundId || '',
      categoryId: '',
      amount: item.amount.toString(),
      paymentMethod: item.paymentMethod,
      bankAccount: '',
      payerPayeeName: item.payerPayee || '',
      description: item.description || '',
      transactionDate: new Date(item.date).toISOString().split('T')[0],
      images: item.images || [],
      notes: item.notes || ''
    });
    setShowEditDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    approved: transactions.filter(t => t.status === 'approved').length,
    rejected: transactions.filter(t => t.status === 'rejected').length,
    totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0)
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Giao dịch</h1>
          <p className="text-gray-500">Tạo và quản lý các khoản thu chi</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setCreateType(activeTab);
          setShowCreateDialog(true);
        }} className="gap-2">
          <Plus size={18} />
          Tạo giao dịch
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TransactionType)}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="income" className="gap-2">
            <ArrowDownCircle size={16} className="text-green-600" />
            Khoản thu
          </TabsTrigger>
          <TabsTrigger value="expense" className="gap-2">
            <ArrowUpCircle size={16} className="text-red-600" />
            Khoản chi
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Tổng số</CardDescription>
                <CardTitle>{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Chờ duyệt</CardDescription>
                <CardTitle className="text-yellow-600">{stats.pending}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Đã duyệt</CardDescription>
                <CardTitle className="text-green-600">{stats.approved}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Từ chối</CardDescription>
                <CardTitle className="text-red-600">{stats.rejected}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Tổng tiền</CardDescription>
                <CardTitle className={activeTab === 'income' ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(stats.totalAmount)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {activeTab === 'income' ? 'Danh sách khoản thu' : 'Danh sách khoản chi'}
                </CardTitle>
                <CardDescription>
                  Quản lý các giao dịch {activeTab === 'income' ? 'thu' : 'chi'}
                </CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>{activeTab === 'income' ? 'Người nộp' : 'Người nhận'}</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                      <TableHead>Hình ảnh</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-mono">{item.code}</TableCell>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>{item.payerPayee || 'N/A'}</TableCell>
                        <TableCell className={`text-right font-semibold ${
                          activeTab === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell>
                          {item.images.length > 0 ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
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
                          <StatusBadge status={item.status} variant="sm" />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {item.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(item)}
                                  title="Sửa"
                                >
                                  <Pencil size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDelete(item)}
                                  title="Xóa"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </>
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
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Tạo {createType === 'income' ? 'khoản thu' : 'khoản chi'} mới
            </DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo giao dịch mới
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                type="button"
                variant={createType === 'income' ? 'default' : 'outline'}
                onClick={() => setCreateType('income')}
                className="flex-1 gap-2"
              >
                <ArrowDownCircle size={16} />
                Khoản thu
              </Button>
              <Button
                type="button"
                variant={createType === 'expense' ? 'default' : 'outline'}
                onClick={() => setCreateType('expense')}
                className="flex-1 gap-2"
              >
                <ArrowUpCircle size={16} />
                Khoản chi
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Giáo xứ *</Label>
                <Select
                  value={formData.parishId}
                  onValueChange={(v) => setFormData({ ...formData, parishId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giáo xứ" />
                  </SelectTrigger>
                  <SelectContent>
                    {parishes.filter(p => p._id).map((p) => (
                      <SelectItem key={p._id!.toString()} value={p._id!.toString()}>
                        {p.parishName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{createType === 'income' ? 'Quỹ *' : 'Nguồn quỹ (tùy chọn)'}</Label>
                <Select
                  value={formData.fundId}
                  onValueChange={(v) => setFormData({ ...formData, fundId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quỹ" />
                  </SelectTrigger>
                  <SelectContent>
                    {funds.filter(f => f._id).map((f) => (
                      <SelectItem key={f._id!.toString()} value={f._id!.toString()}>
                        {f.fundName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {createType === 'expense' && (
                <div className="space-y-2 col-span-2">
                  <Label>Danh mục chi</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục chi" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.filter(cat => cat._id).map((cat) => (
                        <SelectItem key={cat._id!.toString()} value={cat._id!.toString()}>
                          {cat.categoryCode} - {cat.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Số tiền *</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Ngày *</Label>
                <Input
                  type="date"
                  value={formData.transactionDate}
                  onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>{createType === 'income' ? 'Người nộp' : 'Người nhận'}</Label>
                <Input
                  placeholder={createType === 'income' ? 'Tên người nộp' : 'Tên người nhận'}
                  value={formData.payerPayeeName}
                  onChange={(e) => setFormData({ ...formData, payerPayeeName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Hình thức</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offline">Tiền mặt</SelectItem>
                    <SelectItem value="online">Chuyển khoản</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.paymentMethod === 'online' && (
                <div className="space-y-2 col-span-2">
                  <Label>Tài khoản ngân hàng</Label>
                  <Input
                    placeholder="Số tài khoản"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2 col-span-2">
                <Label>Diễn giải</Label>
                <Textarea
                  placeholder="Nội dung giao dịch"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Hình ảnh chứng từ (tối đa 5 ảnh)</Label>
                <ImageUpload
                  images={formData.images}
                  onChange={(imgs) => setFormData({ ...formData, images: imgs })}
                  maxImages={5}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Ghi chú</Label>
                <Textarea
                  placeholder="Ghi chú thêm"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Đang tạo...' : 'Tạo giao dịch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sửa giao dịch</DialogTitle>
            <DialogDescription>
              Chỉ có thể sửa giao dịch đang chờ duyệt
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Số tiền *</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>{selectedItem?.type === 'income' ? 'Người nộp' : 'Người nhận'}</Label>
                <Input
                  placeholder={selectedItem?.type === 'income' ? 'Tên người nộp' : 'Tên người nhận'}
                  value={formData.payerPayeeName}
                  onChange={(e) => setFormData({ ...formData, payerPayeeName: e.target.value })}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Diễn giải</Label>
                <Textarea
                  placeholder="Nội dung giao dịch"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Hình ảnh chứng từ</Label>
                <ImageUpload
                  images={formData.images}
                  onChange={(imgs) => setFormData({ ...formData, images: imgs })}
                  maxImages={5}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Ghi chú</Label>
                <Textarea
                  placeholder="Ghi chú thêm"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setSelectedItem(null);
              resetForm();
            }}>
              Hủy
            </Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Gallery */}
      {selectedItem && (
        <ImageGallery
          images={selectedItem.images}
          open={showGallery}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  );
}
