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
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Building2, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { formatCompactCurrency } from '@/lib/utils';

interface BankAccountItem {
  _id: string;
  accountCode: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankBranch?: string;
  accountType: 'income' | 'expense' | 'both';
  parishId?: string;
  balance?: number;
  isDefault: boolean;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: Date;
}

const bankList = [
  'Vietcombank',
  'VietinBank',
  'BIDV',
  'Agribank',
  'Techcombank',
  'MB Bank',
  'ACB',
  'VPBank',
  'Sacombank',
  'HDBank',
  'TPBank',
  'OCB',
  'SHB',
  'VIB',
  'MSB',
  'Eximbank',
  'SeABank',
  'LienVietPostBank',
  'NCB',
  'ABBank',
  'BacABank',
  'PGBank',
  'VietABank',
  'VietCapitalBank',
  'KienLongBank',
  'NamABank',
  'Khác'
];

export default function BankAccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccountItem | null>(null);

  const [formData, setFormData] = useState({
    accountCode: '',
    accountName: '',
    accountNumber: '',
    bankName: '',
    bankBranch: '',
    balance: '',
    isDefault: false,
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [statusFilter]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/bank-accounts?${params}`);
      if (response.ok) {
        const result = await response.json();
        setAccounts(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      accountCode: '',
      accountName: '',
      accountNumber: '',
      bankName: '',
      bankBranch: '',
      balance: '',
      isDefault: false,
      notes: ''
    });
  };

  const handleCreate = async () => {
    if (!formData.accountCode || !formData.accountName || !formData.accountNumber || !formData.bankName) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          balance: formData.balance ? parseFloat(formData.balance) : 0
        })
      });

      if (response.ok) {
        setShowCreateDialog(false);
        resetForm();
        fetchAccounts();
        alert('Tạo tài khoản thành công');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể tạo tài khoản'}`);
      }
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Không thể tạo tài khoản');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAccount) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/bank-accounts/${selectedAccount._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          balance: formData.balance ? parseFloat(formData.balance) : 0
        })
      });

      if (response.ok) {
        setShowEditDialog(false);
        setSelectedAccount(null);
        resetForm();
        fetchAccounts();
        alert('Cập nhật tài khoản thành công');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể cập nhật'}`);
      }
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Không thể cập nhật tài khoản');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (account: BankAccountItem) => {
    if (!confirm(`Bạn có chắc muốn vô hiệu hóa tài khoản ${account.accountCode}?`)) return;

    try {
      const response = await fetch(`/api/bank-accounts/${account._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchAccounts();
        alert('Đã vô hiệu hóa tài khoản');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể xóa'}`);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Không thể xóa tài khoản');
    }
  };

  const openEditDialog = (account: BankAccountItem) => {
    setSelectedAccount(account);
    setFormData({
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      bankBranch: account.bankBranch || '',
      balance: account.balance?.toString() || '',
      isDefault: account.isDefault,
      notes: account.notes || ''
    });
    setShowEditDialog(true);
  };

  const stats = {
    total: accounts.length,
    active: accounts.filter(a => a.status === 'active').length,
    totalBalance: accounts.reduce((sum, a) => sum + (a.balance || 0), 0)
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Tài khoản Ngân hàng</h1>
          <p className="text-gray-500">Danh sách tài khoản ngân hàng để nhận/chi tiền</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setShowCreateDialog(true);
        }} className="gap-2">
          <Plus size={18} />
          Thêm tài khoản
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng tài khoản</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Đang hoạt động</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng số dư</CardDescription>
            <CardTitle className="text-xl text-blue-600">{formatCompactCurrency(stats.totalBalance)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Danh sách Tài khoản</CardTitle>
            <CardDescription>Quản lý các tài khoản ngân hàng của Giáo phận</CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Đã vô hiệu</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Chưa có tài khoản ngân hàng nào</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                resetForm();
                setShowCreateDialog(true);
              }}>
                Thêm tài khoản đầu tiên
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã TK</TableHead>
                  <TableHead>Tên TK</TableHead>
                  <TableHead>Số TK</TableHead>
                  <TableHead>Ngân hàng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account._id}>
                    <TableCell className="font-mono">
                      <div className="flex items-center gap-2">
                        {account.accountCode}
                        {account.isDefault && (
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{account.accountName}</TableCell>
                    <TableCell className="font-mono">{account.accountNumber}</TableCell>
                    <TableCell>
                      <div>{account.bankName}</div>
                      {account.bankBranch && (
                        <div className="text-sm text-gray-500">{account.bankBranch}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {account.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(account)}
                          title="Sửa"
                        >
                          <Pencil size={16} />
                        </Button>
                        {account.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(account)}
                            title="Vô hiệu hóa"
                          >
                            <Trash2 size={16} />
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

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm Tài khoản Ngân hàng</DialogTitle>
            <DialogDescription>
              Thêm tài khoản ngân hàng mới để quản lý thu chi
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mã tài khoản *</Label>
              <Input
                placeholder="VD: TK-001"
                value={formData.accountCode}
                onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Tên tài khoản *</Label>
              <Input
                placeholder="VD: Tài khoản thu Giáo phận"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Số tài khoản *</Label>
              <Input
                placeholder="VD: 1234567890"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngân hàng *</Label>
                <Select
                  value={formData.bankName}
                  onValueChange={(v) => setFormData({ ...formData, bankName: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngân hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankList.map((bank) => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chi nhánh</Label>
                <Input
                  placeholder="VD: BMT"
                  value={formData.bankBranch}
                  onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Đặt làm tài khoản mặc định
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea
                placeholder="Ghi chú về tài khoản..."
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sửa Tài khoản Ngân hàng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin tài khoản: {selectedAccount?.accountCode}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mã tài khoản</Label>
              <Input
                value={formData.accountCode}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label>Tên tài khoản *</Label>
              <Input
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Số tài khoản *</Label>
              <Input
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngân hàng *</Label>
                <Select
                  value={formData.bankName}
                  onValueChange={(v) => setFormData({ ...formData, bankName: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bankList.map((bank) => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chi nhánh</Label>
                <Input
                  value={formData.bankBranch}
                  onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefaultEdit"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="isDefaultEdit" className="cursor-pointer">
                Đặt làm tài khoản mặc định
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setSelectedAccount(null);
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
    </div>
  );
}
