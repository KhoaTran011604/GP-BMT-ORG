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
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

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

interface AccountBalance {
  _id: string;
  accountCode: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  totalIncome: number;
  totalExpense: number;
  totalAdjustmentIncrease: number;
  totalAdjustmentDecrease: number;
  balance: number;
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
  const [balances, setBalances] = useState<Map<string, AccountBalance>>(new Map());
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

  // Delete confirmation dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BankAccountItem | null>(null);
  const [deleting, setDeleting] = useState(false);

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

      const [accountsRes, balancesRes] = await Promise.all([
        fetch(`/api/bank-accounts?${params}`),
        fetch('/api/balances?type=bank_account')
      ]);

      if (accountsRes.ok) {
        const result = await accountsRes.json();
        setAccounts(result.data || []);
      }

      if (balancesRes.ok) {
        const balancesResult = await balancesRes.json();
        const balancesData = balancesResult.data || [];
        const balancesMap = new Map<string, AccountBalance>();
        balancesData.forEach((b: AccountBalance) => {
          balancesMap.set(b._id.toString(), b);
        });
        setBalances(balancesMap);
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

  const handleDelete = (account: BankAccountItem) => {
    setDeleteTarget(account);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/bank-accounts/${deleteTarget._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        setDeleteTarget(null);
        fetchAccounts();
        alert('Đã vô hiệu hóa tài khoản');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể xóa'}`);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Không thể xóa tài khoản');
    } finally {
      setDeleting(false);
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

  // Calculate total balance from calculated balances
  const totalCalculatedBalance = Array.from(balances.values()).reduce((sum, b) => sum + b.balance, 0);

  const stats = {
    total: accounts.length,
    active: accounts.filter(a => a.status === 'active').length,
    totalBalance: totalCalculatedBalance
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Quản lý Tài khoản Ngân hàng</h1>
          <p className="page-description">Danh sách tài khoản ngân hàng để nhận/chi tiền</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setShowCreateDialog(true);
        }} className="h-12 px-6 text-base font-semibold">
          <Plus size={20} className="mr-2" />
          Thêm tài khoản
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="stat-card">
            <p className="stat-label">Tổng tài khoản</p>
            <div className="stat-value">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="stat-card">
            <p className="stat-label">Đang hoạt động</p>
            <div className="stat-value text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="stat-card">
            <p className="stat-label">Tổng số dư</p>
            <div className="stat-value text-blue-600">{formatCompactCurrency(stats.totalBalance)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl sm:text-2xl">Danh sách Tài khoản</CardTitle>
            <CardDescription className="text-base mt-1">Quản lý các tài khoản ngân hàng của Giáo phận</CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 h-12 text-base">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-base py-3">Tất cả</SelectItem>
              <SelectItem value="active" className="text-base py-3">Đang hoạt động</SelectItem>
              <SelectItem value="inactive" className="text-base py-3">Đã vô hiệu</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="empty-state">
              <p className="empty-state-text">Đang tải...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="empty-state">
              <Building2 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className="empty-state-text">Chưa có tài khoản ngân hàng nào</p>
              <Button className="h-12 px-6 text-base font-semibold mt-4" onClick={() => {
                resetForm();
                setShowCreateDialog(true);
              }}>
                Thêm tài khoản đầu tiên
              </Button>
            </div>
          ) : (
            <Table className="table-lg">
              <TableHeader>
                <TableRow>
                  <TableHead>Mã TK</TableHead>
                  <TableHead>Tên TK</TableHead>
                  <TableHead>Số TK</TableHead>
                  <TableHead>Ngân hàng</TableHead>
                  <TableHead className="text-right">Số dư</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => {
                  const accountBalance = balances.get(account._id);
                  return (
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
                      <TableCell className="text-right">
                        <div className={`font-medium ${accountBalance && accountBalance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {accountBalance
                            ? formatCompactCurrency(accountBalance.balance)
                            : '-'
                          }
                        </div>
  
                      </TableCell>
                      <TableCell>
                        <Badge className={account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {account.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => openEditDialog(account)}
                            title="Chỉnh sửa"
                            className="action-btn"
                          >
                            <Pencil />
                          </Button>
                          {account.status === 'active' && (
                            <Button
                              variant="ghost"
                              className="action-btn text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(account)}
                              title="Vô hiệu hóa"
                            >
                              <Trash2 />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Thêm Tài khoản Ngân hàng</DialogTitle>
            <DialogDescription>
              Thêm tài khoản ngân hàng mới để quản lý thu chi
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Mã tài khoản *</Label>
              <Input
                placeholder="VD: TK-001"
                value={formData.accountCode}
                onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Tên tài khoản *</Label>
              <Input
                placeholder="VD: Tài khoản thu Giáo phận"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Số tài khoản *</Label>
              <Input
                placeholder="VD: 1234567890"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="h-12 text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">Ngân hàng *</Label>
                <Select
                  value={formData.bankName}
                  onValueChange={(v) => setFormData({ ...formData, bankName: v })}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Chọn ngân hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankList.map((bank) => (
                      <SelectItem key={bank} value={bank} className="text-base py-3">{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Chi nhánh</Label>
                <Input
                  placeholder="VD: BMT"
                  value={formData.bankBranch}
                  onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                  className="h-12 text-base"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="h-5 w-5"
              />
              <Label htmlFor="isDefault" className="cursor-pointer text-base">
                Đặt làm tài khoản mặc định
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Ghi chú</Label>
              <Textarea
                placeholder="Ghi chú về tài khoản..."
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="text-base"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="h-12 px-6 text-base">
              Hủy bỏ
            </Button>
            <Button onClick={handleCreate} disabled={submitting} className="h-12 px-6 text-base">
              {submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Sửa Tài khoản Ngân hàng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin tài khoản: {selectedAccount?.accountCode}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Mã tài khoản</Label>
              <Input
                value={formData.accountCode}
                disabled
                className="bg-gray-100 h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Tên tài khoản *</Label>
              <Input
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Số tài khoản *</Label>
              <Input
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="h-12 text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">Ngân hàng *</Label>
                <Select
                  value={formData.bankName}
                  onValueChange={(v) => setFormData({ ...formData, bankName: v })}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bankList.map((bank) => (
                      <SelectItem key={bank} value={bank} className="text-base py-3">{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Chi nhánh</Label>
                <Input
                  value={formData.bankBranch}
                  onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                  className="h-12 text-base"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isDefaultEdit"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="h-5 w-5"
              />
              <Label htmlFor="isDefaultEdit" className="cursor-pointer text-base">
                Đặt làm tài khoản mặc định
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Ghi chú</Label>
              <Textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="text-base"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setSelectedAccount(null);
              resetForm();
            }} className="h-12 px-6 text-base">
              Hủy bỏ
            </Button>
            <Button onClick={handleUpdate} disabled={submitting} className="h-12 px-6 text-base">
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
        title="Xác nhận vô hiệu hóa"
        description={`Bạn có chắc muốn vô hiệu hóa tài khoản ${deleteTarget?.accountCode}?`}
        confirmText="Vô hiệu hóa"
        loading={deleting}
      />
    </div>
  );
}
