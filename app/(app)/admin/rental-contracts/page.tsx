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
import { Plus, Pencil, Trash2, FileText, ArrowRightCircle, Eye, Receipt, CheckCircle, XCircle, Loader2, FileSignature, Users, Calendar, Building2, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FormSection, FormField, FormLabel, FormGrid } from '@/components/ui/form-section';
import { useAuth } from '@/lib/auth-context';
import { Fund, BankAccount } from '@/lib/schemas';
import { formatCompactCurrency } from '@/lib/utils';
import { ContactCombobox } from '@/components/finance/ContactCombobox';
import { QuickAddContactDialog } from '@/components/finance/QuickAddContactDialog';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

interface ContractIncome {
  _id: string;
  incomeCode: string;
  amount: number;
  incomeDate: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: string;
  description?: string;
}

interface Asset {
  _id: string;
  assetCode: string;
  assetName: string;
  assetType: 'land' | 'building' | 'vehicle' | 'equipment';
  location: string;
  area?: number;
  status: string;
}

interface RentalContractItem {
  _id: string;
  contractCode: string;
  parishId: string;
  assetId?: string; // FK to assets - Liên kết với tài sản
  propertyName: string;
  propertyAddress: string;
  propertyArea?: number;
  propertyType: string;
  tenantName: string;
  tenantPhone?: string;
  tenantBankName?: string; // Tên ngân hàng bên thuê
  tenantBankBranch?: string; // Chi nhánh ngân hàng bên thuê
  tenantBankAccount?: string; // Số tài khoản bên thuê
  tenantContactId?: string; // FK to contacts - liên kết với đối tượng nhận gửi
  startDate: Date;
  endDate: Date;
  rentAmount: number;
  paymentCycle: string;
  depositAmount: number;
  paymentMethod?: string; // Phương thức thanh toán từ HĐ
  bankAccountId?: string; // TK ngân hàng nhận tiền từ HĐ
  bankAccount?: string; // Hiển thị TK ngân hàng
  status: string;
  createdAt: Date;
}

export default function RentalContractsPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<RentalContractItem[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [contacts, setContacts] = useState<{ _id: string; name: string; phone?: string }[]>([]);
  const [showQuickAddContact, setShowQuickAddContact] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<RentalContractItem | null>(null);

  // Contract incomes state
  const [contractIncomes, setContractIncomes] = useState<ContractIncome[]>([]);
  const [loadingIncomes, setLoadingIncomes] = useState(false);

  const [formData, setFormData] = useState({
    contractCode: '',
    parishId: '',
    assetId: '',
    propertyName: '',
    propertyAddress: '',
    propertyArea: '',
    propertyType: 'house',
    tenantName: '',
    tenantIdNumber: '',
    tenantPhone: '',
    tenantAddress: '',
    tenantEmail: '',
    tenantBankName: '', // Tên ngân hàng bên thuê
    tenantBankBranch: '', // Chi nhánh ngân hàng bên thuê
    tenantBankAccount: '', // Số tài khoản bên thuê
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    rentAmount: '',
    paymentCycle: 'monthly',
    depositAmount: '',
    paymentMethod: 'offline',
    bankAccountId: '',
    bankAccount: '',
    terms: '',
    notes: ''
  });

  const [convertData, setConvertData] = useState({
    fundId: '',
    amount: '',
    incomeDate: new Date().toISOString().split('T')[0],
    paymentPeriod: '',
    paymentMethod: 'offline',
    bankAccountId: '',
    bankAccount: '',
    contactId: '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RentalContractItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
    fetchParishesAndFunds();
  }, [statusFilter]);

  // Set default parishId from user
  useEffect(() => {
    if (user?.parishId) {
      setFormData(prev => ({ ...prev, parishId: user.parishId! }));
    }
  }, [user?.parishId]);

  const fetchParishesAndFunds = async () => {
    try {
      const [fundsRes, bankAccountsRes, assetsRes, contactsRes] = await Promise.all([
        fetch('/api/funds'),
        fetch('/api/bank-accounts?status=active'),
        fetch('/api/assets?status=active&available=true'), // Only get available (not rented) assets
        fetch('/api/contacts?status=active')
      ]);

      if (fundsRes.ok) {
        const fundsData = await fundsRes.json();
        setFunds(fundsData.data || []);
      }

      if (bankAccountsRes.ok) {
        const bankAccountsData = await bankAccountsRes.json();
        setBankAccounts(bankAccountsData.data || []);
      }

      if (assetsRes.ok) {
        const assetsData = await assetsRes.json();
        // Assets API returns array directly
        setAssets(Array.isArray(assetsData) ? assetsData : (assetsData.data || []));
      }

      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setContacts(contactsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching parishes/funds/bankAccounts/assets/contacts:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/rental-contracts?${params}`);
      if (response.ok) {
        const result = await response.json();
        setContracts(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContractIncomes = async (contractId: string) => {
    setLoadingIncomes(true);
    try {
      // Fetch incomes linked to this contract
      const response = await fetch(`/api/incomes?rentalContractId=${contractId}`);
      if (response.ok) {
        const result = await response.json();
        setContractIncomes(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching contract incomes:', error);
    } finally {
      setLoadingIncomes(false);
    }
  };

  const resetForm = () => {
    setFormData({
      contractCode: '',
      parishId: user?.parishId || '',
      assetId: '',
      propertyName: '',
      propertyAddress: '',
      propertyArea: '',
      propertyType: 'house',
      tenantName: '',
      tenantIdNumber: '',
      tenantPhone: '',
      tenantAddress: '',
      tenantEmail: '',
      tenantBankName: '',
      tenantBankBranch: '',
      tenantBankAccount: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      rentAmount: '',
      paymentCycle: 'monthly',
      depositAmount: '',
      paymentMethod: 'offline',
      bankAccountId: '',
      bankAccount: '',
      terms: '',
      notes: ''
    });
  };

  // Map asset type to property type
  const mapAssetTypeToPropertyType = (assetType: string) => {
    const mapping: { [key: string]: string } = {
      'land': 'land',
      'building': 'house',
      'vehicle': 'other',
      'equipment': 'other'
    };
    return mapping[assetType] || 'other';
  };

  // Handle asset selection - auto-fill property info
  const handleAssetSelect = (assetId: string) => {
    const selectedAsset = assets.find(a => a._id === assetId);
    if (selectedAsset) {
      setFormData(prev => ({
        ...prev,
        assetId,
        propertyName: selectedAsset.assetName,
        propertyAddress: selectedAsset.location || '',
        propertyArea: selectedAsset.area?.toString() || '',
        propertyType: mapAssetTypeToPropertyType(selectedAsset.assetType)
      }));
    } else {
      setFormData(prev => ({ ...prev, assetId }));
    }
  };

  // Check if tenant has bank info for online payment
  const canSelectOnlinePayment = formData.tenantBankName.trim() !== '' && formData.tenantBankAccount.trim() !== '';

  const handleCreate = async () => {
    if (!formData.contractCode || !formData.parishId || !formData.assetId || !formData.propertyName ||
        !formData.tenantName || !formData.startDate || !formData.endDate || !formData.rentAmount) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc (bao gồm Tài sản)');
      return;
    }

    if (formData.paymentMethod === 'online' && !formData.bankAccountId) {
      alert('Vui lòng chọn tài khoản ngân hàng khi thanh toán chuyển khoản');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/rental-contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          propertyArea: formData.propertyArea ? parseFloat(formData.propertyArea) : undefined,
          rentAmount: parseFloat(formData.rentAmount),
          depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : 0
        })
      });

      if (response.ok) {
        setShowCreateDialog(false);
        resetForm();
        fetchData();
        alert('Tạo hợp đồng thành công');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể tạo hợp đồng'}`);
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('Không thể tạo hợp đồng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedContract) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/rental-contracts/${selectedContract._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          propertyArea: formData.propertyArea ? parseFloat(formData.propertyArea) : undefined,
          rentAmount: parseFloat(formData.rentAmount),
          depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : 0
        })
      });

      if (response.ok) {
        setShowEditDialog(false);
        setSelectedContract(null);
        resetForm();
        fetchData();
        alert('Cập nhật hợp đồng thành công');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể cập nhật'}`);
      }
    } catch (error) {
      console.error('Error updating contract:', error);
      alert('Không thể cập nhật hợp đồng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (contract: RentalContractItem) => {
    setDeleteTarget(contract);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/rental-contracts/${deleteTarget._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        setDeleteTarget(null);
        fetchData();
        alert('Xóa hợp đồng thành công');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể xóa'}`);
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert('Không thể xóa hợp đồng');
    } finally {
      setDeleting(false);
    }
  };

  const openEditDialog = async (contract: RentalContractItem) => {
    setSelectedContract(contract);
    setFormData({
      contractCode: contract.contractCode,
      parishId: contract.parishId,
      assetId: contract.assetId || '',
      propertyName: contract.propertyName,
      propertyAddress: contract.propertyAddress,
      propertyArea: contract.propertyArea?.toString() || '',
      propertyType: contract.propertyType,
      tenantName: contract.tenantName,
      tenantIdNumber: '',
      tenantPhone: contract.tenantPhone || '',
      tenantAddress: '',
      tenantEmail: '',
      tenantBankName: contract.tenantBankName || '',
      tenantBankBranch: contract.tenantBankBranch || '',
      tenantBankAccount: contract.tenantBankAccount || '',
      startDate: new Date(contract.startDate).toISOString().split('T')[0],
      endDate: new Date(contract.endDate).toISOString().split('T')[0],
      rentAmount: contract.rentAmount.toString(),
      paymentCycle: contract.paymentCycle,
      depositAmount: contract.depositAmount.toString(),
      paymentMethod: 'offline',
      bankAccountId: '',
      bankAccount: '',
      terms: '',
      notes: ''
    });
    setShowEditDialog(true);
  };

  const handleConvertToIncome = async () => {
    if (!selectedContract || !convertData.fundId || !convertData.amount || !convertData.paymentPeriod) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (convertData.paymentMethod === 'online' && !convertData.bankAccountId) {
      alert('Vui lòng chọn tài khoản ngân hàng');
      return;
    }

    setSubmitting(true);
    try {
      // Get bank account display string
      const selectedBankAccount = convertData.bankAccountId
        ? bankAccounts.find(ba => ba._id?.toString() === convertData.bankAccountId)
        : null;
      const bankAccountDisplay = selectedBankAccount
        ? `${selectedBankAccount.accountNumber} - ${selectedBankAccount.bankName}`
        : undefined;

      // Get selected contact name
      const selectedContact = convertData.contactId
        ? contacts.find(c => c._id === convertData.contactId)
        : null;
      const payerName = selectedContact?.name || selectedContract.tenantName;

      const response = await fetch(`/api/rental-contracts/${selectedContract._id}/convert-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...convertData,
          amount: parseFloat(convertData.amount),
          bankAccountId: convertData.bankAccountId || undefined,
          bankAccount: bankAccountDisplay,
          senderId: convertData.contactId || undefined,
          payerName
        })
      });

      if (response.ok) {
        const result = await response.json();
        setShowConvertDialog(false);
        setConvertData({
          fundId: '',
          amount: '',
          incomeDate: new Date().toISOString().split('T')[0],
          paymentPeriod: '',
          paymentMethod: 'offline',
          bankAccountId: '',
          bankAccount: '',
          contactId: '',
          notes: ''
        });
        alert(`Đã chuyển đổi thành giao dịch thu: ${result.data.incomeCode}`);
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể chuyển đổi'}`);
      }
    } catch (error) {
      console.error('Error converting payment:', error);
      alert('Không thể chuyển đổi thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-gray-100 text-gray-800',
      terminated: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      active: 'Đang thuê',
      pending: 'Chờ kích hoạt',
      expired: 'Hết hạn',
      terminated: 'Đã chấm dứt'
    };
    return texts[status] || status;
  };

  const getPropertyTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      land: 'Đất',
      house: 'Nhà',
      apartment: 'Căn hộ',
      commercial: 'Thương mại',
      other: 'Khác'
    };
    return types[type] || type;
  };

  const getPaymentCycleText = (cycle: string) => {
    const cycles: { [key: string]: string } = {
      monthly: 'Hàng tháng',
      quarterly: 'Hàng quý',
      yearly: 'Hàng năm'
    };
    return cycles[cycle] || cycle;
  };

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    expired: contracts.filter(c => c.status === 'expired').length,
    totalRevenue: contracts.reduce((sum, c) => sum + c.rentAmount, 0)
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Quản lý Hợp đồng Cho thuê</h1>
          <p className="page-description">Quản lý hợp đồng và chuyển đổi thành giao dịch</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setShowCreateDialog(true);
        }} className="h-12 px-6 text-base font-semibold">
          <Plus size={20} className="mr-2" />
          Tạo hợp đồng
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileSignature className="text-blue-600" size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.total}</div>
                <p className="stat-label">Tổng số hợp đồng</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <div className="stat-value text-green-600">{stats.active}</div>
                <p className="stat-label">Đang hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-gray-600" size={24} />
              </div>
              <div>
                <div className="stat-value text-gray-600">{stats.expired}</div>
                <p className="stat-label">Hết hạn</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wallet className="text-purple-600" size={24} />
              </div>
              <div>
                <div className="stat-value text-purple-600">{formatCompactCurrency(stats.totalRevenue)}</div>
                <p className="stat-label">Doanh thu/tháng</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl">Danh sách Hợp đồng</CardTitle>
            <CardDescription className="text-base mt-1">Quản lý các hợp đồng cho thuê bất động sản</CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 text-base w-full sm:w-48">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-base py-3">Tất cả</SelectItem>
              <SelectItem value="active" className="text-base py-3">Đang thuê</SelectItem>
              <SelectItem value="pending" className="text-base py-3">Chờ kích hoạt</SelectItem>
              <SelectItem value="expired" className="text-base py-3">Hết hạn</SelectItem>
              <SelectItem value="terminated" className="text-base py-3">Đã chấm dứt</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="empty-state">
              <p className="empty-state-text">Đang tải...</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="empty-state">
              <FileSignature size={64} className="mx-auto mb-4 opacity-50" />
              <p className="empty-state-text">Chưa có hợp đồng nào</p>
            </div>
          ) : (
            <Table className="table-lg">
              <TableHeader>
                <TableRow>
                  <TableHead>Mã HĐ</TableHead>
                  <TableHead>Tên tài sản</TableHead>
                  <TableHead>Bên thuê</TableHead>
                  <TableHead>Giá thuê</TableHead>
                  <TableHead>Chu kỳ</TableHead>
                  <TableHead>Thời hạn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract._id}>
                    <TableCell className="font-mono">{contract.contractCode}</TableCell>
                    <TableCell>
                      <div className="font-medium">{contract.propertyName}</div>
                      <div className="text-sm text-gray-500">{getPropertyTypeText(contract.propertyType)}</div>
                    </TableCell>
                    <TableCell>
                      <div>{contract.tenantName}</div>
                      {contract.tenantPhone && (
                        <div className="text-sm text-gray-500">{contract.tenantPhone}</div>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCompactCurrency(contract.rentAmount)}
                    </TableCell>
                    <TableCell>{getPaymentCycleText(contract.paymentCycle)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-sm px-3 py-1 ${getStatusColor(contract.status)}`}>
                        {getStatusText(contract.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          className="action-btn"
                          onClick={() => {
                            setSelectedContract(contract);
                            setContractIncomes([]);
                            fetchContractIncomes(contract._id);
                            setShowDetailDialog(true);
                          }}
                          title="Chi tiết"
                        >
                          <Eye size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          className="action-btn"
                          onClick={() => openEditDialog(contract)}
                          title="Sửa"
                        >
                          <Pencil size={18} />
                        </Button>
                        {contract.status === 'active' && (
                          <Button
                            variant="ghost"
                            className="action-btn text-blue-600 hover:text-blue-700"
                            onClick={() => {
                              setSelectedContract(contract);
                              setConvertData({
                                ...convertData,
                                amount: contract.rentAmount.toString(),
                                contactId: contract.tenantContactId || '',
                                paymentMethod: contract.paymentMethod || 'offline',
                                bankAccountId: contract.bankAccountId || ''
                              });
                              setShowConvertDialog(true);
                            }}
                            title="Tạo giao dịch thu"
                          >
                            <ArrowRightCircle size={18} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          className="action-btn text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(contract)}
                          title="Xóa"
                        >
                          <Trash2 size={18} />
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

      {/* Create Dialog - Full Screen */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent size="fullscreen">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-2xl font-bold">Tạo Hợp đồng Cho thuê Mới</DialogTitle>
                <DialogDescription className="text-base">
                  Điền đầy đủ thông tin hợp đồng cho thuê bất động sản
                </DialogDescription>
              </DialogHeader>

              {/* Thông tin cơ bản */}
            <FormSection title="Thông tin cơ bản" icon={<FileSignature size={18} />}>
              <FormGrid>
                <FormField>
                  <FormLabel required>Mã hợp đồng</FormLabel>
                  <Input
                    placeholder="VD: HD-2024-001"
                    value={formData.contractCode}
                    onChange={(e) => setFormData({ ...formData, contractCode: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>

                <FormField className="col-span-2">
                  <FormLabel required>Tài sản cho thuê (chỉ hiển thị tài sản chưa được thuê)</FormLabel>
                  <Select
                    value={formData.assetId}
                    onValueChange={handleAssetSelect}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Chọn tài sản" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.length === 0 ? (
                        <div className="p-3 text-base text-gray-500 text-center">
                          Không có tài sản khả dụng
                        </div>
                      ) : (
                        assets.map((asset) => (
                          <SelectItem key={asset._id} value={asset._id} className="text-base py-3">
                            {asset.assetCode} - {asset.assetName} {asset.area ? `(${asset.area} m²)` : ''}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Thông tin Bất động sản */}
            <FormSection title="Thông tin Bất động sản" icon={<Building2 size={18} />}>
              {formData.assetId && (
                <p className="text-sm text-blue-600 mb-4">Thông tin tài sản được tự động điền từ tài sản đã chọn</p>
              )}
              <FormGrid>
                <FormField className="col-span-2">
                  <FormLabel required>Tên tài sản</FormLabel>
                  <Input
                    placeholder="VD: Nhà 2 tầng đường Nguyễn Văn A"
                    value={formData.propertyName}
                    onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                    readOnly={!!formData.assetId}
                    className={`h-12 text-base ${formData.assetId ? 'bg-gray-50' : ''}`}
                  />
                </FormField>

                <FormField className="col-span-2">
                  <FormLabel required>Địa chỉ</FormLabel>
                  <Input
                    placeholder="Địa chỉ đầy đủ"
                    value={formData.propertyAddress}
                    onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                    readOnly={!!formData.assetId}
                    className={`h-12 text-base ${formData.assetId ? 'bg-gray-50' : ''}`}
                  />
                </FormField>

                <FormField>
                  <FormLabel>Loại tài sản</FormLabel>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(v) => setFormData({ ...formData, propertyType: v })}
                    disabled={!!formData.assetId}
                  >
                    <SelectTrigger className={`h-12 text-base ${formData.assetId ? 'bg-gray-50' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="land" className="text-base py-3">Đất</SelectItem>
                      <SelectItem value="house" className="text-base py-3">Nhà</SelectItem>
                      <SelectItem value="apartment" className="text-base py-3">Căn hộ</SelectItem>
                      <SelectItem value="commercial" className="text-base py-3">Thương mại</SelectItem>
                      <SelectItem value="other" className="text-base py-3">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField>
                  <FormLabel>Diện tích (m²)</FormLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.propertyArea}
                    onChange={(e) => setFormData({ ...formData, propertyArea: e.target.value })}
                    readOnly={!!formData.assetId}
                    className={`h-12 text-base ${formData.assetId ? 'bg-gray-50' : ''}`}
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Thông tin Bên thuê */}
            <FormSection title="Thông tin Bên thuê" icon={<Users size={18} />}>
              <FormGrid>
                <FormField>
                  <FormLabel required>Tên bên thuê</FormLabel>
                  <Input
                    placeholder="Họ tên đầy đủ"
                    value={formData.tenantName}
                    onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>

                <FormField>
                  <FormLabel>CMND/CCCD</FormLabel>
                  <Input
                    placeholder="Số CMND/CCCD"
                    value={formData.tenantIdNumber}
                    onChange={(e) => setFormData({ ...formData, tenantIdNumber: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>

                <FormField>
                  <FormLabel>Số điện thoại</FormLabel>
                  <Input
                    placeholder="0123456789"
                    value={formData.tenantPhone}
                    onChange={(e) => setFormData({ ...formData, tenantPhone: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>

                <FormField>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.tenantEmail}
                    onChange={(e) => setFormData({ ...formData, tenantEmail: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>

                <FormField className="col-span-2">
                  <FormLabel>Địa chỉ</FormLabel>
                  <Input
                    placeholder="Địa chỉ bên thuê"
                    value={formData.tenantAddress}
                    onChange={(e) => setFormData({ ...formData, tenantAddress: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>

                <FormField className="col-span-2">
                  <FormLabel>Thông tin ngân hàng (bên thuê)</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      placeholder="Ngân hàng"
                      value={formData.tenantBankName}
                      onChange={(e) => setFormData({ ...formData, tenantBankName: e.target.value })}
                      className="h-12 text-base"
                    />
                    <Input
                      placeholder="Chi nhánh"
                      value={formData.tenantBankBranch}
                      onChange={(e) => setFormData({ ...formData, tenantBankBranch: e.target.value })}
                      className="h-12 text-base"
                    />
                    <Input
                      placeholder="Số tài khoản"
                      value={formData.tenantBankAccount}
                      onChange={(e) => setFormData({ ...formData, tenantBankAccount: e.target.value })}
                      className="h-12 text-base"
                    />
                  </div>
                  {!canSelectOnlinePayment && (
                    <p className="text-sm text-amber-600 mt-2">Nhập ngân hàng và STK để chọn thanh toán chuyển khoản</p>
                  )}
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Điều khoản Hợp đồng */}
            <FormSection title="Điều khoản Hợp đồng" icon={<Calendar size={18} />}>
              <FormGrid>
                <FormField>
                  <FormLabel required>Ngày bắt đầu</FormLabel>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>

                <FormField>
                  <FormLabel required>Ngày kết thúc</FormLabel>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>

                <FormField>
                  <FormLabel required>Giá thuê (VNĐ)</FormLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.rentAmount}
                    onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>

                <FormField>
                  <FormLabel>Chu kỳ thanh toán</FormLabel>
                  <Select
                    value={formData.paymentCycle}
                    onValueChange={(v) => setFormData({ ...formData, paymentCycle: v })}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly" className="text-base py-3">Hàng tháng</SelectItem>
                      <SelectItem value="quarterly" className="text-base py-3">Hàng quý</SelectItem>
                      <SelectItem value="yearly" className="text-base py-3">Hàng năm</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField>
                  <FormLabel>Tiền đặt cọc (VNĐ)</FormLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>

                <FormField>
                  <FormLabel>Hình thức thanh toán</FormLabel>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(v) => {
                      if (v === 'online' && !canSelectOnlinePayment) return;
                      setFormData({ ...formData, paymentMethod: v, bankAccountId: '', bankAccount: '' });
                    }}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offline" className="text-base py-3">Tiền mặt</SelectItem>
                      <SelectItem value="online" disabled={!canSelectOnlinePayment} className="text-base py-3">
                        Chuyển khoản {!canSelectOnlinePayment && '(cần nhập TK bên thuê)'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                {formData.paymentMethod === 'online' && (
                  <FormField className="col-span-2">
                    <FormLabel required>Tài khoản ngân hàng (nhận tiền)</FormLabel>
                    {bankAccounts.filter(ba => ba.accountType === 'income' || ba.accountType === 'both').length > 0 ? (
                      <Select
                        value={formData.bankAccountId}
                        onValueChange={(v) => {
                          const selectedBankAccount = bankAccounts.find(ba => ba._id?.toString() === v);
                          setFormData({
                            ...formData,
                            bankAccountId: v,
                            bankAccount: selectedBankAccount
                              ? `${selectedBankAccount.accountNumber} - ${selectedBankAccount.bankName}`
                              : ''
                          });
                        }}
                      >
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts
                            .filter(ba => ba.accountType === 'income' || ba.accountType === 'both')
                            .map((ba) => (
                              <SelectItem key={ba._id!.toString()} value={ba._id!.toString()} className="text-base py-3">
                                {ba.accountNumber} - {ba.bankName}
                                {ba.isDefault && ' ★'}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-base text-gray-500 p-3 border rounded-md bg-gray-50">
                        Chưa có tài khoản ngân hàng. <a href="/finance/bank-accounts" className="text-blue-600 hover:underline">Thêm tài khoản</a>
                      </div>
                    )}
                  </FormField>
                )}

                <FormField className="col-span-2">
                  <FormLabel>Điều khoản hợp đồng</FormLabel>
                  <Textarea
                    placeholder="Các điều khoản chi tiết..."
                    rows={3}
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    className="text-base"
                  />
                </FormField>

                <FormField className="col-span-2">
                  <FormLabel>Ghi chú</FormLabel>
                  <Textarea
                    placeholder="Ghi chú thêm..."
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="text-base"
                  />
                </FormField>
              </FormGrid>
            </FormSection>

              <DialogFooter className="pt-6 border-t gap-3">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="h-14 px-8 text-lg sm:w-auto w-full">
                  Hủy
                </Button>
                <Button onClick={handleCreate} disabled={submitting} className="h-14 px-8 text-lg font-semibold sm:w-auto w-full">
                  {submitting ? 'Đang tạo...' : 'Tạo hợp đồng'}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Similar to Create but with pre-filled data */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Sửa Hợp đồng</DialogTitle>
            <DialogDescription className="text-base">
              Cập nhật thông tin hợp đồng cho thuê
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Contract details */}
            <FormSection title="Thông tin Hợp đồng" icon={<FileSignature size={18} />}>
              <FormGrid>
                <FormField>
                  <FormLabel required>Giá thuê (VNĐ)</FormLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.rentAmount}
                    onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>

                <FormField>
                  <FormLabel required>Ngày kết thúc</FormLabel>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Tenant bank info */}
            <FormSection title="Thông tin Ngân hàng Bên thuê" icon={<Wallet size={18} />}>
              <FormGrid cols={3}>
                <FormField>
                  <FormLabel>Ngân hàng</FormLabel>
                  <Input
                    placeholder="Ngân hàng"
                    value={formData.tenantBankName}
                    onChange={(e) => setFormData({ ...formData, tenantBankName: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>
                <FormField>
                  <FormLabel>Chi nhánh</FormLabel>
                  <Input
                    placeholder="Chi nhánh"
                    value={formData.tenantBankBranch}
                    onChange={(e) => setFormData({ ...formData, tenantBankBranch: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>
                <FormField>
                  <FormLabel>Số tài khoản</FormLabel>
                  <Input
                    placeholder="Số tài khoản"
                    value={formData.tenantBankAccount}
                    onChange={(e) => setFormData({ ...formData, tenantBankAccount: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>
              </FormGrid>
            </FormSection>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setSelectedContract(null);
              resetForm();
            }} className="h-12 px-8 text-base sm:w-auto w-full">
              Hủy
            </Button>
            <Button onClick={handleUpdate} disabled={submitting} className="h-12 px-8 text-base sm:w-auto w-full">
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Income Dialog - Full Screen */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent size="fullscreen">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-2xl font-bold">Tạo Giao dịch Thu từ Hợp đồng</DialogTitle>
                <DialogDescription className="text-lg">
                  Hợp đồng: <span className="font-semibold">{selectedContract?.contractCode}</span> - {selectedContract?.propertyName}
                </DialogDescription>
              </DialogHeader>

              <FormSection title="Thông tin Giao dịch" icon={<Receipt size={20} />}>
                <FormGrid>
                  <FormField>
                    <FormLabel required className="text-base font-semibold">Quỹ</FormLabel>
                    <Select
                      value={convertData.fundId}
                      onValueChange={(v) => setConvertData({ ...convertData, fundId: v })}
                    >
                      <SelectTrigger className="h-14 text-lg">
                        <SelectValue placeholder="Chọn quỹ" />
                      </SelectTrigger>
                      <SelectContent>
                        {funds.filter(f => f._id).map((f) => (
                          <SelectItem key={f._id!.toString()} value={f._id!.toString()} className="text-base py-3">
                            {f.fundName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField>
                    <FormLabel required className="text-base font-semibold">Số tiền (VNĐ)</FormLabel>
                    <Input
                      type="number"
                      placeholder="0"
                      value={convertData.amount}
                      onChange={(e) => setConvertData({ ...convertData, amount: e.target.value })}
                      className="h-14 text-lg"
                    />
                  </FormField>

                  <FormField>
                    <FormLabel required className="text-base font-semibold">Ngày thu</FormLabel>
                    <Input
                      type="date"
                      value={convertData.incomeDate}
                      onChange={(e) => setConvertData({ ...convertData, incomeDate: e.target.value })}
                      className="h-14 text-lg"
                    />
                  </FormField>

                  <FormField>
                    <FormLabel required className="text-base font-semibold">Kỳ thanh toán</FormLabel>
                    <Input
                      placeholder="VD: Tháng 01/2024, Quý 1/2024"
                      value={convertData.paymentPeriod}
                      onChange={(e) => setConvertData({ ...convertData, paymentPeriod: e.target.value })}
                      className="h-14 text-lg"
                    />
                  </FormField>

                  <FormField className="col-span-2">
                    <FormLabel className="text-base font-semibold">Người gửi (Đối tượng)</FormLabel>
                    <ContactCombobox
                      value={convertData.contactId}
                      onChange={(v) => setConvertData({ ...convertData, contactId: v })}
                      onCreateNew={() => setShowQuickAddContact(true)}
                      contacts={contacts}
                      placeholder="Chọn người gửi..."
                    />
                    <p className="text-base text-muted-foreground mt-2">
                      Mặc định: <span className="font-medium">{selectedContract?.tenantName}</span>
                    </p>
                  </FormField>
                </FormGrid>
              </FormSection>

              <FormSection title="Hình thức Thanh toán" icon={<Wallet size={20} />}>
                <FormGrid>
                  <FormField>
                    <FormLabel className="text-base font-semibold">Hình thức</FormLabel>
                    <Select
                      value={convertData.paymentMethod}
                      onValueChange={(v) => setConvertData({ ...convertData, paymentMethod: v, bankAccountId: '' })}
                    >
                      <SelectTrigger className="h-14 text-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="offline" className="text-base py-3">Tiền mặt</SelectItem>
                        <SelectItem value="online" className="text-base py-3">Chuyển khoản</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  {convertData.paymentMethod === 'online' && (
                    <FormField>
                      <FormLabel required className="text-base font-semibold">Tài khoản ngân hàng (nhận tiền)</FormLabel>
                      {bankAccounts.filter(ba => ba.accountType === 'income' || ba.accountType === 'both').length > 0 ? (
                        <Select
                          value={convertData.bankAccountId}
                          onValueChange={(v) => setConvertData({ ...convertData, bankAccountId: v })}
                        >
                          <SelectTrigger className="h-14 text-lg">
                            <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                          </SelectTrigger>
                          <SelectContent>
                            {bankAccounts
                              .filter(ba => ba.accountType === 'income' || ba.accountType === 'both')
                              .map((ba) => (
                                <SelectItem key={ba._id!.toString()} value={ba._id!.toString()} className="text-base py-3">
                                  {ba.accountNumber} - {ba.bankName}
                                  {ba.isDefault && ' ★'}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-lg text-gray-500 p-4 border rounded-md bg-gray-50">
                          Chưa có tài khoản ngân hàng. <a href="/finance/bank-accounts" className="text-blue-600 hover:underline">Thêm tài khoản</a>
                        </div>
                      )}
                    </FormField>
                  )}

                  <FormField className="col-span-2">
                    <FormLabel className="text-base font-semibold">Ghi chú</FormLabel>
                    <Textarea
                      placeholder="Ghi chú thêm..."
                      rows={4}
                      value={convertData.notes}
                      onChange={(e) => setConvertData({ ...convertData, notes: e.target.value })}
                      className="text-lg"
                    />
                  </FormField>
                </FormGrid>
              </FormSection>

              <DialogFooter className="pt-6 border-t gap-3">
                <Button variant="outline" onClick={() => {
                  setShowConvertDialog(false);
                  setConvertData({
                    fundId: '',
                    amount: '',
                    incomeDate: new Date().toISOString().split('T')[0],
                    paymentPeriod: '',
                    paymentMethod: 'offline',
                    bankAccountId: '',
                    bankAccount: '',
                    contactId: '',
                    notes: ''
                  });
                }} className="h-14 px-8 text-lg sm:w-auto w-full">
                  Hủy
                </Button>
                <Button onClick={handleConvertToIncome} disabled={submitting} className="h-14 px-8 text-lg font-semibold sm:w-auto w-full">
                  {submitting ? 'Đang xử lý...' : 'Tạo giao dịch'}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Add Contact Dialog */}
      <QuickAddContactDialog
        open={showQuickAddContact}
        onOpenChange={setShowQuickAddContact}
        onCreated={(newContact) => {
          setContacts([...contacts, newContact]);
          setConvertData({ ...convertData, contactId: newContact._id });
        }}
      />

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Chi tiết Hợp đồng</DialogTitle>
            <DialogDescription className="text-base">
              Xem thông tin chi tiết và các khoản thu phát sinh từ hợp đồng
            </DialogDescription>
          </DialogHeader>

          {selectedContract && (
            <div className="space-y-6">
              {/* Contract Info */}
              <FormSection title="Thông tin Hợp đồng" icon={<FileSignature size={18} />}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mã hợp đồng</p>
                    <p className="text-base font-semibold">{selectedContract.contractCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                    <Badge className={`text-sm px-3 py-1 ${getStatusColor(selectedContract.status)}`}>
                      {getStatusText(selectedContract.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tên tài sản</p>
                    <p className="text-base font-semibold">{selectedContract.propertyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Loại</p>
                    <p className="text-base font-semibold">{getPropertyTypeText(selectedContract.propertyType)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                    <p className="text-base font-semibold">{selectedContract.propertyAddress}</p>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Thông tin Bên thuê" icon={<Users size={18} />}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bên thuê</p>
                    <p className="text-base font-semibold">{selectedContract.tenantName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                    <p className="text-base font-semibold">{selectedContract.tenantPhone || 'N/A'}</p>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Điều khoản Thanh toán" icon={<Wallet size={18} />}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Giá thuê</p>
                    <p className="text-lg font-bold text-green-600">{formatCompactCurrency(selectedContract.rentAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Chu kỳ</p>
                    <p className="text-base font-semibold">{getPaymentCycleText(selectedContract.paymentCycle)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ngày bắt đầu</p>
                    <p className="text-base font-semibold">{formatDate(selectedContract.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ngày kết thúc</p>
                    <p className="text-base font-semibold">{formatDate(selectedContract.endDate)}</p>
                  </div>
                </div>
              </FormSection>

              {/* Contract Incomes Section */}
              <FormSection title="Các khoản thu phát sinh từ HĐ" icon={<Receipt size={18} />}>
                <div className="flex items-center justify-between mb-4">
                  {selectedContract.status === 'active' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setConvertData({
                          ...convertData,
                          amount: selectedContract.rentAmount.toString(),
                          contactId: selectedContract.tenantContactId || '',
                          paymentMethod: selectedContract.paymentMethod || 'offline',
                          bankAccountId: selectedContract.bankAccountId || ''
                        });
                        setShowDetailDialog(false);
                        setShowConvertDialog(true);
                      }}
                      className="h-10 px-4 text-base"
                    >
                      <ArrowRightCircle size={18} className="mr-2" />
                      Tạo khoản thu mới
                    </Button>
                  )}
                </div>

                {loadingIncomes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin mr-2" size={24} />
                    <span className="text-base text-gray-500">Đang tải...</span>
                  </div>
                ) : contractIncomes.length === 0 ? (
                  <div className="empty-state">
                    <Receipt className="mx-auto mb-4 opacity-50" size={48} />
                    <p className="empty-state-text">Chưa có khoản thu nào từ hợp đồng này</p>
                    <p className="text-base text-gray-500 mt-2">Bấm "Tạo khoản thu mới" để thêm</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-500">Tổng số khoản thu</p>
                        <p className="text-lg font-semibold">{contractIncomes.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tổng tiền</p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCompactCurrency(contractIncomes.reduce((sum, i) => sum + i.amount, 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Đã duyệt</p>
                        <p className="text-lg font-semibold">
                          {contractIncomes.filter(i => i.status === 'approved').length} / {contractIncomes.length}
                        </p>
                      </div>
                    </div>

                    {/* Income List */}
                    <Table className="table-lg">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã</TableHead>
                          <TableHead>Ngày</TableHead>
                          <TableHead className="text-right">Số tiền</TableHead>
                          <TableHead>Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contractIncomes.map((income) => (
                          <TableRow key={income._id}>
                            <TableCell className="font-mono">{income.incomeCode}</TableCell>
                            <TableCell>{formatDate(income.incomeDate)}</TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              {formatCompactCurrency(income.amount)}
                            </TableCell>
                            <TableCell>
                              {income.status === 'approved' ? (
                                <Badge className="text-sm px-3 py-1 bg-green-100 text-green-700">
                                  <CheckCircle size={14} className="mr-1" />
                                  Đã duyệt
                                </Badge>
                              ) : income.status === 'pending' ? (
                                <Badge className="text-sm px-3 py-1 bg-yellow-100 text-yellow-700">
                                  Chờ duyệt
                                </Badge>
                              ) : (
                                <Badge className="text-sm px-3 py-1 bg-red-100 text-red-700">
                                  <XCircle size={14} className="mr-1" />
                                  Từ chối
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </FormSection>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowDetailDialog(false)} className="h-12 px-8 text-base">Đóng</Button>
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
        description={`Bạn có chắc muốn xóa hợp đồng ${deleteTarget?.contractCode}?`}
        loading={deleting}
      />
    </div>
  );
}
