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
import { Plus, Pencil, Trash2, FileText, ArrowRightCircle, Eye, Receipt, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { Fund, BankAccount } from '@/lib/schemas';
import { formatCompactCurrency } from '@/lib/utils';
import { ContactCombobox } from '@/components/finance/ContactCombobox';
import { QuickAddContactDialog } from '@/components/finance/QuickAddContactDialog';

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

  useEffect(() => {
    fetchData();
    fetchParishesAndFunds();
  }, [statusFilter]);

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

  const handleDelete = async (contract: RentalContractItem) => {
    if (!confirm(`Bạn có chắc muốn xóa hợp đồng ${contract.contractCode}?`)) return;

    try {
      const response = await fetch(`/api/rental-contracts/${contract._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
        alert('Xóa hợp đồng thành công');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể xóa'}`);
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert('Không thể xóa hợp đồng');
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
          <h1 className="text-3xl font-bold">Quản lý Hợp đồng Cho thuê</h1>
          <p className="text-gray-500">Quản lý hợp đồng và chuyển đổi thành giao dịch</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setShowCreateDialog(true);
        }} className="gap-2">
          <Plus size={18} />
          Tạo hợp đồng
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng số hợp đồng</CardDescription>
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
            <CardDescription>Hết hạn</CardDescription>
            <CardTitle className="text-2xl text-gray-600">{stats.expired}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Doanh thu/tháng</CardDescription>
            <CardTitle className="text-lg text-blue-600">{formatCompactCurrency(stats.totalRevenue)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Danh sách Hợp đồng</CardTitle>
            <CardDescription>Quản lý các hợp đồng cho thuê bất động sản</CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang thuê</SelectItem>
              <SelectItem value="pending">Chờ kích hoạt</SelectItem>
              <SelectItem value="expired">Hết hạn</SelectItem>
              <SelectItem value="terminated">Đã chấm dứt</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Chưa có hợp đồng nào</div>
          ) : (
            <Table>
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                        {getStatusText(contract.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedContract(contract);
                            setContractIncomes([]);
                            fetchContractIncomes(contract._id);
                            setShowDetailDialog(true);
                          }}
                          title="Chi tiết"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(contract)}
                          title="Sửa"
                        >
                          <Pencil size={16} />
                        </Button>
                        {contract.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-600 hover:text-blue-700"
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
                            <ArrowRightCircle size={16} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(contract)}
                          title="Xóa"
                        >
                          <Trash2 size={16} />
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

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo Hợp đồng Cho thuê Mới</DialogTitle>
            <DialogDescription>
              Điền đầy đủ thông tin hợp đồng cho thuê bất động sản
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mã hợp đồng *</Label>
              <Input
                placeholder="VD: HD-2024-001"
                value={formData.contractCode}
                onChange={(e) => setFormData({ ...formData, contractCode: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Tài sản cho thuê * (chỉ hiển thị tài sản chưa được thuê)</Label>
              <Select
                value={formData.assetId}
                onValueChange={handleAssetSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tài sản" />
                </SelectTrigger>
                <SelectContent>
                  {assets.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      Không có tài sản khả dụng
                    </div>
                  ) : (
                    assets.map((asset) => (
                      <SelectItem key={asset._id} value={asset._id}>
                        {asset.assetCode} - {asset.assetName} {asset.area ? `(${asset.area} m²)` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Thông tin Bất động sản (tự động điền từ tài sản)</h3>
              {formData.assetId && (
                <p className="text-sm text-blue-600 mb-3">Thông tin tài sản được tự động điền từ tài sản đã chọn</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Tên tài sản *</Label>
                  <Input
                    placeholder="VD: Nhà 2 tầng đường Nguyễn Văn A"
                    value={formData.propertyName}
                    onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                    readOnly={!!formData.assetId}
                    className={formData.assetId ? 'bg-gray-50' : ''}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Địa chỉ *</Label>
                  <Input
                    placeholder="Địa chỉ đầy đủ"
                    value={formData.propertyAddress}
                    onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                    readOnly={!!formData.assetId}
                    className={formData.assetId ? 'bg-gray-50' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Loại tài sản</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(v) => setFormData({ ...formData, propertyType: v })}
                    disabled={!!formData.assetId}
                  >
                    <SelectTrigger className={formData.assetId ? 'bg-gray-50' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="land">Đất</SelectItem>
                      <SelectItem value="house">Nhà</SelectItem>
                      <SelectItem value="apartment">Căn hộ</SelectItem>
                      <SelectItem value="commercial">Thương mại</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Diện tích (m²)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.propertyArea}
                    onChange={(e) => setFormData({ ...formData, propertyArea: e.target.value })}
                    readOnly={!!formData.assetId}
                    className={formData.assetId ? 'bg-gray-50' : ''}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Thông tin Bên thuê</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tên bên thuê *</Label>
                  <Input
                    placeholder="Họ tên đầy đủ"
                    value={formData.tenantName}
                    onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>CMND/CCCD</Label>
                  <Input
                    placeholder="Số CMND/CCCD"
                    value={formData.tenantIdNumber}
                    onChange={(e) => setFormData({ ...formData, tenantIdNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input
                    placeholder="0123456789"
                    value={formData.tenantPhone}
                    onChange={(e) => setFormData({ ...formData, tenantPhone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.tenantEmail}
                    onChange={(e) => setFormData({ ...formData, tenantEmail: e.target.value })}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Địa chỉ</Label>
                  <Input
                    placeholder="Địa chỉ bên thuê"
                    value={formData.tenantAddress}
                    onChange={(e) => setFormData({ ...formData, tenantAddress: e.target.value })}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Thông tin ngân hàng (bên thuê)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Ngân hàng"
                      value={formData.tenantBankName}
                      onChange={(e) => setFormData({ ...formData, tenantBankName: e.target.value })}
                    />
                    <Input
                      placeholder="Chi nhánh"
                      value={formData.tenantBankBranch}
                      onChange={(e) => setFormData({ ...formData, tenantBankBranch: e.target.value })}
                    />
                    <Input
                      placeholder="Số tài khoản"
                      value={formData.tenantBankAccount}
                      onChange={(e) => setFormData({ ...formData, tenantBankAccount: e.target.value })}
                    />
                  </div>
                  {!canSelectOnlinePayment && (
                    <p className="text-xs text-amber-600">Nhập ngân hàng và STK để chọn thanh toán chuyển khoản</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Điều khoản Hợp đồng</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ngày bắt đầu *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ngày kết thúc *</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Giá thuê (VNĐ) *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.rentAmount}
                    onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Chu kỳ thanh toán</Label>
                  <Select
                    value={formData.paymentCycle}
                    onValueChange={(v) => setFormData({ ...formData, paymentCycle: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Hàng tháng</SelectItem>
                      <SelectItem value="quarterly">Hàng quý</SelectItem>
                      <SelectItem value="yearly">Hàng năm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tiền đặt cọc (VNĐ)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hình thức thanh toán</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(v) => {
                      if (v === 'online' && !canSelectOnlinePayment) return;
                      setFormData({ ...formData, paymentMethod: v, bankAccountId: '', bankAccount: '' });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offline">Tiền mặt</SelectItem>
                      <SelectItem value="online" disabled={!canSelectOnlinePayment}>
                        Chuyển khoản {!canSelectOnlinePayment && '(cần nhập TK bên thuê)'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.paymentMethod === 'online' && (
                  <div className="space-y-2 col-span-2">
                    <Label>Tài khoản ngân hàng (nhận tiền) *</Label>
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
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts
                            .filter(ba => ba.accountType === 'income' || ba.accountType === 'both')
                            .map((ba) => (
                              <SelectItem key={ba._id!.toString()} value={ba._id!.toString()}>
                                {ba.accountNumber} - {ba.bankName}
                                {ba.isDefault && ' ★'}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm text-gray-500 p-2 border rounded-md bg-gray-50">
                        Chưa có tài khoản ngân hàng. <a href="/finance/bank-accounts" className="text-blue-600 hover:underline">Thêm tài khoản</a>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2 col-span-2">
                  <Label>Điều khoản hợp đồng</Label>
                  <Textarea
                    placeholder="Các điều khoản chi tiết..."
                    rows={3}
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Ghi chú</Label>
                  <Textarea
                    placeholder="Ghi chú thêm..."
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Đang tạo...' : 'Tạo hợp đồng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Similar to Create but with pre-filled data */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sửa Hợp đồng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin hợp đồng cho thuê
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Contract details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Giá thuê (VNĐ) *</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.rentAmount}
                  onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Ngày kết thúc *</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Tenant bank info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Thông tin Ngân hàng Bên thuê</h3>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Ngân hàng"
                  value={formData.tenantBankName}
                  onChange={(e) => setFormData({ ...formData, tenantBankName: e.target.value })}
                />
                <Input
                  placeholder="Chi nhánh"
                  value={formData.tenantBankBranch}
                  onChange={(e) => setFormData({ ...formData, tenantBankBranch: e.target.value })}
                />
                <Input
                  placeholder="Số tài khoản"
                  value={formData.tenantBankAccount}
                  onChange={(e) => setFormData({ ...formData, tenantBankAccount: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setSelectedContract(null);
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

      {/* Convert to Income Dialog */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo Giao dịch Thu từ Hợp đồng</DialogTitle>
            <DialogDescription>
              Hợp đồng: {selectedContract?.contractCode} - {selectedContract?.propertyName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Quỹ *</Label>
              <Select
                value={convertData.fundId}
                onValueChange={(v) => setConvertData({ ...convertData, fundId: v })}
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

            <div className="space-y-2">
              <Label>Số tiền (VNĐ) *</Label>
              <Input
                type="number"
                placeholder="0"
                value={convertData.amount}
                onChange={(e) => setConvertData({ ...convertData, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Ngày thu *</Label>
              <Input
                type="date"
                value={convertData.incomeDate}
                onChange={(e) => setConvertData({ ...convertData, incomeDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Kỳ thanh toán *</Label>
              <Input
                placeholder="VD: Tháng 01/2024, Quý 1/2024"
                value={convertData.paymentPeriod}
                onChange={(e) => setConvertData({ ...convertData, paymentPeriod: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Người gửi (Đối tượng)</Label>
              <ContactCombobox
                value={convertData.contactId}
                onChange={(v) => setConvertData({ ...convertData, contactId: v })}
                onCreateNew={() => setShowQuickAddContact(true)}
                contacts={contacts}
                placeholder="Chọn người gửi..."
              />
              <p className="text-xs text-muted-foreground">
                Mặc định: {selectedContract?.tenantName}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Hình thức thanh toán</Label>
              <Select
                value={convertData.paymentMethod}
                onValueChange={(v) => setConvertData({ ...convertData, paymentMethod: v, bankAccountId: '' })}
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

            {convertData.paymentMethod === 'online' && (
              <div className="space-y-2">
                <Label>Tài khoản ngân hàng (nhận tiền) *</Label>
                {bankAccounts.filter(ba => ba.accountType === 'income' || ba.accountType === 'both').length > 0 ? (
                  <Select
                    value={convertData.bankAccountId}
                    onValueChange={(v) => setConvertData({ ...convertData, bankAccountId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts
                        .filter(ba => ba.accountType === 'income' || ba.accountType === 'both')
                        .map((ba) => (
                          <SelectItem key={ba._id!.toString()} value={ba._id!.toString()}>
                            {ba.accountNumber} - {ba.bankName}
                            {ba.isDefault && ' ★'}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-gray-500 p-2 border rounded-md bg-gray-50">
                    Chưa có tài khoản ngân hàng. <a href="/finance/bank-accounts" className="text-blue-600 hover:underline">Thêm tài khoản</a>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea
                placeholder="Ghi chú thêm..."
                rows={3}
                value={convertData.notes}
                onChange={(e) => setConvertData({ ...convertData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
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
            }}>
              Hủy
            </Button>
            <Button onClick={handleConvertToIncome} disabled={submitting}>
              {submitting ? 'Đang xử lý...' : 'Tạo giao dịch'}
            </Button>
          </DialogFooter>
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
            <DialogTitle>Chi tiết Hợp đồng</DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết và các khoản thu phát sinh từ hợp đồng
            </DialogDescription>
          </DialogHeader>

          {selectedContract && (
            <div className="space-y-6">
              {/* Contract Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Mã hợp đồng</p>
                  <p className="font-semibold">{selectedContract.contractCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedContract.status)}`}>
                    {getStatusText(selectedContract.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tên tài sản</p>
                  <p className="font-semibold">{selectedContract.propertyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Loại</p>
                  <p className="font-semibold">{getPropertyTypeText(selectedContract.propertyType)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Địa chỉ</p>
                  <p className="font-semibold">{selectedContract.propertyAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bên thuê</p>
                  <p className="font-semibold">{selectedContract.tenantName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-semibold">{selectedContract.tenantPhone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Giá thuê</p>
                  <p className="font-semibold text-green-600">{formatCompactCurrency(selectedContract.rentAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Chu kỳ</p>
                  <p className="font-semibold">{getPaymentCycleText(selectedContract.paymentCycle)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày bắt đầu</p>
                  <p className="font-semibold">{formatDate(selectedContract.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày kết thúc</p>
                  <p className="font-semibold">{formatDate(selectedContract.endDate)}</p>
                </div>
              </div>

              {/* Contract Incomes Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Receipt size={18} className="text-green-600" />
                    <h3 className="font-semibold">Các khoản thu phát sinh từ HĐ</h3>
                  </div>
                  {selectedContract.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
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
                    >
                      <ArrowRightCircle size={14} className="mr-1" />
                      Tạo khoản thu mới
                    </Button>
                  )}
                </div>

                {loadingIncomes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    <span className="text-gray-500">Đang tải...</span>
                  </div>
                ) : contractIncomes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <Receipt className="mx-auto mb-2 text-gray-400" size={32} />
                    <p>Chưa có khoản thu nào từ hợp đồng này</p>
                    <p className="text-sm mt-1">Bấm "Tạo khoản thu mới" để thêm</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500">Tổng số khoản thu</p>
                        <p className="font-semibold">{contractIncomes.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tổng tiền</p>
                        <p className="font-semibold text-green-600">
                          {formatCompactCurrency(contractIncomes.reduce((sum, i) => sum + i.amount, 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Đã duyệt</p>
                        <p className="font-semibold">
                          {contractIncomes.filter(i => i.status === 'approved').length} / {contractIncomes.length}
                        </p>
                      </div>
                    </div>

                    {/* Income List */}
                    <Table>
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
                            <TableCell className="font-mono text-sm">{income.incomeCode}</TableCell>
                            <TableCell>{formatDate(income.incomeDate)}</TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              {formatCompactCurrency(income.amount)}
                            </TableCell>
                            <TableCell>
                              {income.status === 'approved' ? (
                                <Badge className="bg-green-100 text-green-700">
                                  <CheckCircle size={12} className="mr-1" />
                                  Đã duyệt
                                </Badge>
                              ) : income.status === 'pending' ? (
                                <Badge className="bg-yellow-100 text-yellow-700">
                                  Chờ duyệt
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700">
                                  <XCircle size={12} className="mr-1" />
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
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowDetailDialog(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
