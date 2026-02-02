'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FormSection,
  FormField,
  FormLabel,
  FormGrid,
} from '@/components/ui/form-section';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
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
import { CheckCircle, Send, Wallet, Building, Plus, AlertCircle, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatCompactCurrency } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

interface StaffWithContract {
  _id: string;
  staffCode: string;
  fullName: string;
  basicSalary: number;
}

interface Payroll {
  _id: string;
  staffId: string;
  staffName: string;
  staffCode: string;
  period: string;
  basicSalary: number;
  responsibilityAllowance: number;
  mealAllowance: number;
  transportAllowance: number;
  advance: number;
  deductions: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid';
  approvedBy?: string;
  paidAt?: string;
}

interface BankAccount {
  _id: string;
  accountCode: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
}

interface Fund {
  _id: string;
  fundCode: string;
  fundName: string;
}

const currentYear = new Date().getFullYear();
const months = Array.from({ length: 12 }, (_, i) => ({
  value: `${String(i + 1).padStart(2, '0')}/${currentYear}`,
  label: `Tháng ${i + 1}/${currentYear}`
}));

export default function PayrollPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(months[new Date().getMonth()].value);
  const [statusFilter, setStatusFilter] = useState('all');

  // Approval dialog
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'offline' | 'online'>('offline');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>('');
  const [funds, setFunds] = useState<Fund[]>([]);
  const [selectedFund, setSelectedFund] = useState<string>('');

  // Success dialog
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [approvalResult, setApprovalResult] = useState<{
    payrollsApproved: number;
    totalAmount: number;
    expenseCode?: string;
    expensesCreated?: number;
  } | null>(null);

  // Create payroll dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [staffWithContracts, setStaffWithContracts] = useState<StaffWithContract[]>([]);
  const [payrollExistsForPeriod, setPayrollExistsForPeriod] = useState(false);

  // Edit payroll dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    basicSalary: 0,
    responsibilityAllowance: 0,
    mealAllowance: 0,
    transportAllowance: 0,
    advance: 0,
    deductions: 0,
  });

  useEffect(() => {
    fetchPayrolls();
    fetchBankAccounts();
    fetchFunds();
  }, [selectedPeriod]);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payroll?period=${selectedPeriod}`);
      if (res.ok) {
        const data = await res.json();
        setPayrolls(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching payrolls:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const res = await fetch('/api/bank-accounts');
      if (res.ok) {
        const data = await res.json();
        setBankAccounts(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  const fetchFunds = async () => {
    try {
      const res = await fetch('/api/funds');
      if (res.ok) {
        const data = await res.json();
        const fundList = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
        setFunds(fundList);
      }
    } catch (error) {
      console.error('Error fetching funds:', error);
    }
  };

  const filteredPayrolls = payrolls.filter(p => {
    return statusFilter === 'all' || p.status === statusFilter;
  });

  const draftPayrolls = payrolls.filter(p => p.status === 'draft');

  const totals = {
    basicSalary: filteredPayrolls.reduce((sum, p) => sum + p.basicSalary, 0),
    allowances: filteredPayrolls.reduce((sum, p) => sum + p.responsibilityAllowance + p.mealAllowance + p.transportAllowance, 0),
    deductions: filteredPayrolls.reduce((sum, p) => sum + p.deductions + p.advance, 0),
    netSalary: filteredPayrolls.reduce((sum, p) => sum + p.netSalary, 0),
  };

  const draftTotals = {
    netSalary: draftPayrolls.reduce((sum, p) => sum + p.netSalary, 0),
  };

  const handleOpenApprovalDialog = () => {
    if (draftPayrolls.length === 0) {
      alert('Không có phiếu lương nào cần duyệt');
      return;
    }
    setIsApprovalDialogOpen(true);
  };

  const handleOpenCreateDialog = async () => {
    // Check if payroll already exists for this period
    if (payrolls.length > 0) {
      setPayrollExistsForPeriod(true);
      setIsCreateDialogOpen(true);
      return;
    }

    // Fetch staff with active contracts
    try {
      const [staffRes, contractsRes] = await Promise.all([
        fetch('/api/staff?status=active'),
        fetch('/api/contracts?status=active')
      ]);

      let staffData: any[] = [];
      let contractsData: any[] = [];

      if (staffRes.ok) {
        const data = await staffRes.json();
        staffData = Array.isArray(data) ? data : [];
      }

      if (contractsRes.ok) {
        const data = await contractsRes.json();
        contractsData = Array.isArray(data) ? data : [];
      }

      // Filter staff who have active contracts (ensure unique by staffId)
      const staffWithActiveContracts: StaffWithContract[] = [];
      const addedStaffIds = new Set<string>();
      for (const contract of contractsData) {
        const staff = staffData.find(s => s._id === contract.staffId);
        if (staff && !addedStaffIds.has(staff._id)) {
          addedStaffIds.add(staff._id);
          staffWithActiveContracts.push({
            _id: staff._id,
            staffCode: staff.staffCode,
            fullName: staff.fullName,
            basicSalary: contract.basicSalary
          });
        }
      }

      setStaffWithContracts(staffWithActiveContracts);
      setPayrollExistsForPeriod(false);
      setIsCreateDialogOpen(true);
    } catch (error) {
      console.error('Error fetching staff:', error);
      alert('Lỗi khi tải danh sách nhân sự');
    }
  };

  const handleCreatePayroll = async () => {
    if (staffWithContracts.length === 0) {
      alert('Không có nhân sự nào có hợp đồng lao động');
      return;
    }

    setIsCreating(true);
    try {
      let created = 0;
      for (const staff of staffWithContracts) {
        const res = await fetch('/api/payroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            staffId: staff._id,
            staffName: staff.fullName,
            staffCode: staff.staffCode,
            period: selectedPeriod,
            basicSalary: staff.basicSalary,
            responsibilityAllowance: 0,
            mealAllowance: 0,
            transportAllowance: 0,
            advance: 0,
            deductions: 0,
            status: 'draft'
          }),
        });

        if (res.ok) {
          created++;
        }
      }

      setIsCreateDialogOpen(false);
      fetchPayrolls();
      alert(`Đã tạo bảng lương cho ${created} nhân sự`);
    } catch (error) {
      console.error('Error creating payroll:', error);
      alert('Lỗi khi tạo bảng lương');
    } finally {
      setIsCreating(false);
    }
  };

  const handleApprovePayroll = async () => {
    if (!user?.parishId) {
      alert('Không tìm thấy thông tin giáo xứ của người dùng');
      return;
    }

    if (!selectedFund) {
      alert('Vui lòng chọn quỹ');
      return;
    }

    if (paymentMethod === 'online' && !selectedBankAccount) {
      alert('Vui lòng chọn tài khoản ngân hàng');
      return;
    }

    setIsApproving(true);
    try {
      const selectedBank = bankAccounts.find(b => b._id === selectedBankAccount);

      const res = await fetch('/api/payroll/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: selectedPeriod,
          parishId: user.parishId,
          fundId: selectedFund,
          paymentMethod,
          bankAccountId: paymentMethod === 'online' ? selectedBankAccount : undefined,
          bankAccount: paymentMethod === 'online' && selectedBank
            ? `${selectedBank.bankName} - ${selectedBank.accountNumber}`
            : undefined
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setApprovalResult({
          payrollsApproved: result.data.payrollsApproved,
          totalAmount: result.data.totalAmount,
          expensesCreated: result.data.expensesCreated
        });
        setIsApprovalDialogOpen(false);
        setShowSuccessDialog(true);
        fetchPayrolls();
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.error || 'Không thể duyệt bảng lương'}`);
      }
    } catch (error) {
      console.error('Error approving payroll:', error);
      alert('Lỗi khi duyệt bảng lương');
    } finally {
      setIsApproving(false);
    }
  };

  const handleGoToExpenses = () => {
    setShowSuccessDialog(false);
    router.push('/finance/transactions');
  };

  const handleEditPayroll = (payroll: Payroll) => {
    setEditingPayroll(payroll);
    setEditFormData({
      basicSalary: payroll.basicSalary,
      responsibilityAllowance: payroll.responsibilityAllowance,
      mealAllowance: payroll.mealAllowance,
      transportAllowance: payroll.transportAllowance,
      advance: payroll.advance,
      deductions: payroll.deductions,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePayroll = async () => {
    if (!editingPayroll) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/payroll/${editingPayroll._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setIsEditDialogOpen(false);
        setEditingPayroll(null);
        fetchPayrolls();
        alert('Cập nhật bảng lương thành công!');
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.error || 'Không thể cập nhật bảng lương'}`);
      }
    } catch (error) {
      console.error('Error updating payroll:', error);
      alert('Lỗi khi cập nhật bảng lương');
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateEditNetSalary = () => {
    return editFormData.basicSalary +
           editFormData.responsibilityAllowance +
           editFormData.mealAllowance +
           editFormData.transportAllowance -
           editFormData.advance -
           editFormData.deductions;
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
          <h1 className="page-title">Bảng lương</h1>
          <p className="page-description">Quản lý bảng lương hàng tháng</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-52 h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value} className="text-base py-3">{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleOpenCreateDialog} className="h-12 px-6 text-base font-semibold">
            <Plus size={20} className="mr-2" />
            Tạo bảng lương
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="stat-card">
            <div className="stat-value text-blue-600">{filteredPayrolls.length}</div>
            <p className="stat-label">Nhân viên</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="stat-card">
            <div className="stat-value text-green-600">{formatCompactCurrency(totals.basicSalary)}</div>
            <p className="stat-label">Tổng lương cơ bản</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="stat-card">
            <div className="stat-value text-purple-600">{formatCompactCurrency(totals.allowances)}</div>
            <p className="stat-label">Tổng phụ cấp</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="stat-card">
            <div className="stat-value text-orange-600">{formatCompactCurrency(totals.netSalary)}</div>
            <p className="stat-label">Tổng thực lĩnh</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl sm:text-2xl">Bảng lương kỳ {selectedPeriod}</CardTitle>
              <CardDescription className="text-base mt-1">Chi tiết lương từng nhân viên</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44 h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-base py-3">Tất cả</SelectItem>
                  <SelectItem value="draft" className="text-base py-3">Bản nháp</SelectItem>
                  <SelectItem value="approved" className="text-base py-3">Đã duyệt</SelectItem>
                  <SelectItem value="paid" className="text-base py-3">Đã chi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPayrolls.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-icon">💰</p>
              <p className="empty-state-text">Chưa có dữ liệu bảng lương cho kỳ này</p>
              <Button onClick={handleOpenCreateDialog} className="h-12 px-6 text-base font-semibold mt-4">Tạo bảng lương mới</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="table-lg">
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã NV</TableHead>
                    <TableHead>Họ Tên</TableHead>
                    <TableHead className="text-right">Lương CB</TableHead>
                    <TableHead className="text-right">PC Trách nhiệm</TableHead>
                    <TableHead className="text-right">PC Ăn uống</TableHead>
                    <TableHead className="text-right">PC Xăng xe</TableHead>
                    <TableHead className="text-right">Tạm ứng</TableHead>
                    <TableHead className="text-right">Khấu trừ</TableHead>
                    <TableHead className="text-right">Thực lĩnh</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayrolls.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell className="font-mono">{p.staffCode}</TableCell>
                      <TableCell className="font-medium">{p.staffName}</TableCell>
                      <TableCell className="text-right">{formatCompactCurrency(p.basicSalary)}</TableCell>
                      <TableCell className="text-right">{formatCompactCurrency(p.responsibilityAllowance)}</TableCell>
                      <TableCell className="text-right">{formatCompactCurrency(p.mealAllowance)}</TableCell>
                      <TableCell className="text-right">{formatCompactCurrency(p.transportAllowance)}</TableCell>
                      <TableCell className="text-right text-red-600">-{formatCompactCurrency(p.advance)}</TableCell>
                      <TableCell className="text-right text-red-600">-{formatCompactCurrency(p.deductions)}</TableCell>
                      <TableCell className="text-right font-bold text-green-600">{formatCompactCurrency(p.netSalary)}</TableCell>
                      <TableCell>
                        <Badge className={`text-sm px-3 py-1 ${
                          p.status === 'paid' ? 'bg-green-100 text-green-800' :
                          p.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {p.status === 'paid' ? 'Đã chi' :
                           p.status === 'approved' ? 'Chờ duyệt chi' : 'Bản nháp'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {p.status === 'draft' ? (
                          <Button variant="ghost" className="action-btn" onClick={() => handleEditPayroll(p)}>
                            <Pencil size={18} />
                          </Button>
                        ) : (
                          <Button variant="ghost" className="action-btn" disabled>
                            <Pencil size={18} />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals Row */}
                  <TableRow className="bg-gray-50 font-bold">
                    <TableCell colSpan={2}>TỔNG CỘNG</TableCell>
                    <TableCell className="text-right">{formatCompactCurrency(totals.basicSalary)}</TableCell>
                    <TableCell className="text-right" colSpan={3}>{formatCompactCurrency(totals.allowances)}</TableCell>
                    <TableCell className="text-right text-red-600" colSpan={2}>-{formatCompactCurrency(totals.deductions)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCompactCurrency(totals.netSalary)}</TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Actions */}
      {draftPayrolls.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-amber-800">Phê duyệt bảng lương</h3>
                <p className="text-base text-amber-700">
                  {draftPayrolls.length} phiếu lương chờ duyệt - Tổng: {formatCompactCurrency(draftTotals.netSalary)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleOpenApprovalDialog} className="h-12 px-6 text-base font-semibold bg-amber-600 hover:bg-amber-700">
                  <Send size={20} className="mr-2" />
                  Duyệt & Tạo khoản chi
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Duyệt bảng lương & Tạo khoản chi</DialogTitle>
            <DialogDescription>
              Duyệt {draftPayrolls.length} phiếu lương và tạo khoản chi cần phê duyệt
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 p-5 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-base text-gray-600">Kỳ lương</p>
                  <p className="font-semibold text-lg">{selectedPeriod}</p>
                </div>
                <div>
                  <p className="text-base text-gray-600">Số nhân viên</p>
                  <p className="font-semibold text-lg">{draftPayrolls.length}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-base text-gray-600">Tổng thực lĩnh</p>
                  <p className="text-3xl font-bold text-green-600">{formatCompactCurrency(draftTotals.netSalary)}</p>
                </div>
              </div>
            </div>

            <FormSection title="Nguồn quỹ & Hình thức chi">
              <FormField>
                <FormLabel required>Nguồn quỹ</FormLabel>
                <Select value={selectedFund} onValueChange={setSelectedFund}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Chọn quỹ" />
                  </SelectTrigger>
                  <SelectContent>
                    {funds.map((f) => (
                      <SelectItem key={f._id} value={f._id} className="text-base py-3">{f.fundName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField>
                <FormLabel required>Hình thức chi</FormLabel>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button
                    type="button"
                    variant={paymentMethod === 'offline' ? 'default' : 'outline'}
                    className="h-12 text-base justify-start gap-2"
                    onClick={() => setPaymentMethod('offline')}
                  >
                    <Wallet size={20} />
                    Tiền mặt
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === 'online' ? 'default' : 'outline'}
                    className="h-12 text-base justify-start gap-2"
                    onClick={() => setPaymentMethod('online')}
                  >
                    <Building size={20} />
                    Chuyển khoản
                  </Button>
                </div>
              </FormField>

              {/* Bank Account (if online) */}
              {paymentMethod === 'online' && (
                <FormField>
                  <FormLabel required>Tài khoản ngân hàng</FormLabel>
                  <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Chọn tài khoản" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((b) => (
                        <SelectItem key={b._id} value={b._id} className="text-base py-3">
                          {b.bankName} - {b.accountNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            </FormSection>

            {/* Note */}
            <div className="bg-blue-50 p-4 rounded-lg text-base text-blue-800">
              <p className="font-semibold mb-2">Lưu ý:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Sau khi duyệt, hệ thống sẽ tạo 1 khoản chi với tổng tiền lương</li>
                <li>Khoản chi sẽ ở trạng thái "Chờ duyệt" trong mục Quản lý Giao dịch</li>
                <li>Khi khoản chi được duyệt, hệ thống sẽ tự động tạo phiếu chi với chi tiết từng nhân viên</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)} className="h-12 px-8 text-base sm:w-auto w-full">
              Hủy bỏ
            </Button>
            <Button onClick={handleApprovePayroll} disabled={isApproving} className="h-12 px-8 text-base sm:w-auto w-full">
              {isApproving ? 'Đang xử lý...' : 'Duyệt & Tạo khoản chi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600" size={28} />
              </div>
              <AlertDialogTitle className="text-xl">Duyệt bảng lương thành công!</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p className="text-base">Đã duyệt {approvalResult?.payrollsApproved} phiếu lương và tạo {approvalResult?.expensesCreated || 1} khoản chi.</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-base text-gray-600">Số khoản chi đã tạo</p>
                  <p className="font-semibold text-lg">{approvalResult?.expensesCreated || 1} khoản chi</p>
                  <p className="text-base text-gray-600 mt-3">Tổng tiền</p>
                  <p className="font-bold text-xl text-green-600">{formatCompactCurrency(approvalResult?.totalAmount || 0)}</p>
                </div>
                <p className="text-base text-gray-600">
                  Các khoản chi đang chờ phê duyệt tại mục Quản lý Giao dịch.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-12 px-6 text-base">Đóng</AlertDialogCancel>
            <AlertDialogAction onClick={handleGoToExpenses} className="h-12 px-6 text-base">
              Đến Quản lý Giao dịch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Payroll Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Tạo bảng lương kỳ {selectedPeriod}</DialogTitle>
            <DialogDescription>
              {payrollExistsForPeriod
                ? 'Bảng lương cho kỳ này đã được tạo'
                : `Tạo bảng lương cho các nhân sự có HDLD`}
            </DialogDescription>
          </DialogHeader>

          {payrollExistsForPeriod ? (
            <div className="py-4">
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg">
                <div className="flex items-center gap-3 text-amber-800">
                  <AlertCircle size={22} />
                  <p className="font-semibold text-lg">Bảng lương đã tồn tại</p>
                </div>
                <p className="text-base text-amber-700 mt-2">
                  Bảng lương cho kỳ {selectedPeriod} đã được tạo với {payrolls.length} nhân sự.
                  Bạn có thể chỉnh sửa từng dòng lương trong bảng.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {staffWithContracts.length === 0 ? (
                <div className="bg-red-50 border border-red-200 p-5 rounded-lg">
                  <div className="flex items-center gap-3 text-red-800">
                    <AlertCircle size={22} />
                    <p className="font-semibold text-lg">Không có nhân sự nào có HDLD</p>
                  </div>
                  <p className="text-base text-red-700 mt-2">
                    Vui lòng tạo hợp đồng lao động cho nhân sự trước khi tạo bảng lương.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-base text-blue-800">
                      Sẽ tạo bảng lương cho <strong>{staffWithContracts.length}</strong> nhân sự có hợp đồng lao động
                    </p>
                  </div>
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left p-3 text-base font-semibold">Mã NV</th>
                          <th className="text-left p-3 text-base font-semibold">Họ tên</th>
                          <th className="text-right p-3 text-base font-semibold">Lương CB</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffWithContracts.map((s) => (
                          <tr key={s._id} className="border-t">
                            <td className="p-3 font-mono text-base">{s.staffCode}</td>
                            <td className="p-3 text-base">{s.fullName}</td>
                            <td className="p-3 text-right text-green-600 font-semibold text-base">{formatCompactCurrency(s.basicSalary)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Tổng lương cơ bản:</span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatCompactCurrency(staffWithContracts.reduce((sum, s) => sum + s.basicSalary, 0))}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="h-12 px-8 text-base sm:w-auto w-full">
              {payrollExistsForPeriod ? 'Đóng' : 'Hủy bỏ'}
            </Button>
            {!payrollExistsForPeriod && staffWithContracts.length > 0 && (
              <Button onClick={handleCreatePayroll} disabled={isCreating} className="h-12 px-8 text-base sm:w-auto w-full">
                {isCreating ? 'Đang tạo...' : `Tạo bảng lương (${staffWithContracts.length} NV)`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payroll Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { if (!open) setEditingPayroll(null); setIsEditDialogOpen(open); }}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Sửa bảng lương</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin lương cho <strong>{editingPayroll?.staffName}</strong> ({editingPayroll?.staffCode})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <FormSection title="Lương & Phụ cấp">
              <FormGrid columns={2}>
                <FormField>
                  <FormLabel>Lương cơ bản</FormLabel>
                  <Input
                    type="number"
                    value={editFormData.basicSalary}
                    onChange={(e) => setEditFormData({ ...editFormData, basicSalary: parseFloat(e.target.value) || 0 })}
                    className="h-12 text-base"
                  />
                  {editFormData.basicSalary > 0 && (
                    <p className="text-sm text-green-600 mt-1">{formatCompactCurrency(editFormData.basicSalary)}</p>
                  )}
                </FormField>
                <FormField>
                  <FormLabel>PC Trách nhiệm</FormLabel>
                  <Input
                    type="number"
                    value={editFormData.responsibilityAllowance}
                    onChange={(e) => setEditFormData({ ...editFormData, responsibilityAllowance: parseFloat(e.target.value) || 0 })}
                    className="h-12 text-base"
                  />
                  {editFormData.responsibilityAllowance > 0 && (
                    <p className="text-sm text-green-600 mt-1">{formatCompactCurrency(editFormData.responsibilityAllowance)}</p>
                  )}
                </FormField>
              </FormGrid>

              <FormGrid columns={2}>
                <FormField>
                  <FormLabel>PC Ăn uống</FormLabel>
                  <Input
                    type="number"
                    value={editFormData.mealAllowance}
                    onChange={(e) => setEditFormData({ ...editFormData, mealAllowance: parseFloat(e.target.value) || 0 })}
                    className="h-12 text-base"
                  />
                  {editFormData.mealAllowance > 0 && (
                    <p className="text-sm text-green-600 mt-1">{formatCompactCurrency(editFormData.mealAllowance)}</p>
                  )}
                </FormField>
                <FormField>
                  <FormLabel>PC Xăng xe</FormLabel>
                  <Input
                    type="number"
                    value={editFormData.transportAllowance}
                    onChange={(e) => setEditFormData({ ...editFormData, transportAllowance: parseFloat(e.target.value) || 0 })}
                    className="h-12 text-base"
                  />
                  {editFormData.transportAllowance > 0 && (
                    <p className="text-sm text-green-600 mt-1">{formatCompactCurrency(editFormData.transportAllowance)}</p>
                  )}
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection title="Khấu trừ">
              <FormGrid columns={2}>
                <FormField>
                  <FormLabel>Tạm ứng</FormLabel>
                  <Input
                    type="number"
                    value={editFormData.advance}
                    onChange={(e) => setEditFormData({ ...editFormData, advance: parseFloat(e.target.value) || 0 })}
                    className="h-12 text-base"
                  />
                  {editFormData.advance > 0 && (
                    <p className="text-sm text-red-600 mt-1">-{formatCompactCurrency(editFormData.advance)}</p>
                  )}
                </FormField>
                <FormField>
                  <FormLabel>Khấu trừ khác</FormLabel>
                  <Input
                    type="number"
                    value={editFormData.deductions}
                    onChange={(e) => setEditFormData({ ...editFormData, deductions: parseFloat(e.target.value) || 0 })}
                    className="h-12 text-base"
                  />
                  {editFormData.deductions > 0 && (
                    <p className="text-sm text-red-600 mt-1">-{formatCompactCurrency(editFormData.deductions)}</p>
                  )}
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Net Salary Calculation */}
            <div className="bg-gray-50 p-5 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-base text-gray-600">Thực lĩnh:</span>
                <span className="text-3xl font-bold text-green-600">
                  {formatCompactCurrency(calculateEditNetSalary())}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                = Lương CB + PC Trách nhiệm + PC Ăn uống + PC Xăng xe - Tạm ứng - Khấu trừ
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="h-12 px-8 text-base sm:w-auto w-full">
              Hủy bỏ
            </Button>
            <Button onClick={handleUpdatePayroll} disabled={isUpdating} className="h-12 px-8 text-base sm:w-auto w-full">
              {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
