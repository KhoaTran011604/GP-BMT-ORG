'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Plus, Pencil, Trash2, Eye, ArrowDownCircle, ArrowUpCircle, FileText, CheckCircle, XCircle, Receipt, Printer, Search, Filter, Calendar, X, Home, User, CheckSquare } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload } from '@/components/finance/ImageUpload';
import { ImageGallery } from '@/components/finance/ImageGallery';
import { StatusBadge } from '@/components/finance/StatusBadge';
import { Fund, Parish, ExpenseCategory, BankAccount } from '@/lib/schemas';
import { useAuth } from '@/lib/auth-context';
import { formatCompactCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
  categoryId?: string;
  bankAccount?: string;
  fiscalYear?: number;
  fiscalPeriod?: number;
  submittedAt?: string;
  // Source tracking for transparency
  sourceType?: 'manual' | 'rental_contract';
  rentalContractId?: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TransactionType>('income');
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TransactionItem | null>(null);
  const [selectedForDetail, setSelectedForDetail] = useState<TransactionItem | null>(null);
  const [selectedForReject, setSelectedForReject] = useState<TransactionItem | null>(null);
  const [selectedForApprove, setSelectedForApprove] = useState<TransactionItem | null>(null);
  const [createType, setCreateType] = useState<TransactionType>('income');
  const [rejectNote, setRejectNote] = useState('');
  const [approveNote, setApproveNote] = useState('');
  const [currentReceipt, setCurrentReceipt] = useState<any>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  // Multi-select for batch operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchApproveDialog, setShowBatchApproveDialog] = useState(false);
  const [batchProcessing, setBatchProcessing] = useState(false);

  const [formData, setFormData] = useState({
    parishId: '',
    fundId: '',
    categoryId: '',
    amount: '',
    paymentMethod: 'offline',
    bankAccountId: '', // FK to bank_accounts
    payerPayeeName: '',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
    images: [] as string[],
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchFundsAndParishes();
  }, []);

  const fetchFundsAndParishes = async () => {
    try {
      const [fundsRes, parishesRes, categoriesRes, bankAccountsRes] = await Promise.all([
        fetch('/api/funds'),
        fetch('/api/parishes'),
        fetch('/api/expense-categories?isActive=true'),
        fetch('/api/bank-accounts?status=active')
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

      if (bankAccountsRes.ok) {
        const bankAccountsData = await bankAccountsRes.json();
        setBankAccounts(bankAccountsData.data || []);
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
      if (dateFrom) {
        params.append('startDate', dateFrom);
      }
      if (dateTo) {
        params.append('endDate', dateTo);
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
          fundId: item.fundId,
          categoryId: item.categoryId,
          bankAccount: item.bankAccount,
          fiscalYear: item.fiscalYear,
          fiscalPeriod: item.fiscalPeriod,
          submittedAt: activeTab === 'income' ? item.submittedAt : item.requestedAt,
          // Source tracking for income transparency
          sourceType: item.sourceType || 'manual',
          rentalContractId: item.rentalContractId
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
      bankAccountId: '',
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
      // Get selected bank account info
      const selectedBankAccount = formData.bankAccountId
        ? bankAccounts.find(ba => ba._id?.toString() === formData.bankAccountId)
        : null;
      const bankAccountDisplay = selectedBankAccount
        ? `${selectedBankAccount.accountNumber} - ${selectedBankAccount.bankName}`
        : undefined;

      const body = createType === 'income' ? {
        parishId: formData.parishId,
        fundId: formData.fundId,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        bankAccountId: formData.bankAccountId || undefined,
        bankAccount: bankAccountDisplay,
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
        bankAccountId: formData.bankAccountId || undefined,
        bankAccount: bankAccountDisplay,
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
    if (!selectedItem || !formData.amount || !formData.parishId || !formData.transactionDate) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (selectedItem.type === 'income' && !formData.fundId) {
      alert('Vui lòng chọn quỹ');
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = selectedItem.type === 'income'
        ? `/api/incomes/${selectedItem._id}`
        : `/api/expenses/${selectedItem._id}`;

      // Get selected bank account info
      const selectedBankAccount = formData.bankAccountId
        ? bankAccounts.find(ba => ba._id?.toString() === formData.bankAccountId)
        : null;
      const bankAccountDisplay = selectedBankAccount
        ? `${selectedBankAccount.accountNumber} - ${selectedBankAccount.bankName}`
        : undefined;

      const body = selectedItem.type === 'income' ? {
        parishId: formData.parishId,
        fundId: formData.fundId,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        bankAccountId: formData.bankAccountId || undefined,
        bankAccount: bankAccountDisplay,
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
        bankAccountId: formData.bankAccountId || undefined,
        bankAccount: bankAccountDisplay,
        payeeName: formData.payerPayeeName || undefined,
        description: formData.description || undefined,
        expenseDate: formData.transactionDate,
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

  const handleApprove = async () => {
    if (!selectedForApprove || !approveNote.trim()) {
      alert('Vui lòng nhập lý do duyệt');
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = selectedForApprove.type === 'income'
        ? `/api/incomes/${selectedForApprove._id}`
        : `/api/expenses/${selectedForApprove._id}`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          notes: approveNote || undefined
        })
      });

      if (response.ok) {
        alert('Đã duyệt giao dịch thành công');
        setShowApproveDialog(false);
        setShowDetailDialog(false);
        setSelectedForApprove(null);
        setApproveNote('');
        fetchData();
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể duyệt'}`);
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      alert('Không thể duyệt giao dịch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedForReject || !rejectNote.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    setSubmitting(true);
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
        setShowDetailDialog(false);
        setSelectedForReject(null);
        setRejectNote('');
        fetchData();
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể từ chối'}`);
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      alert('Không thể từ chối giao dịch');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchReceipt = async (transactionId: string) => {
    setLoadingReceipt(true);
    try {
      // Fetch receipts với referenceId matching transaction ID
      const receiptsRes = await fetch(`/api/receipts`);

      if (receiptsRes.ok) {
        const receiptsResult = await receiptsRes.json();
        const receipt = receiptsResult.data?.find((r: any) => r.referenceId?.toString() === transactionId);

        if (receipt) {
          // Navigate to receipt detail page
          router.push(`/finance/receipts/${receipt._id}`);
        } else {
          alert('Không tìm thấy phiếu thu/chi');
        }
      }
    } catch (error) {
      console.error('Error fetching receipt:', error);
      alert('Không thể tải phiếu thu/chi');
    } finally {
      setLoadingReceipt(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!currentReceipt || !selectedItem) return;

    const parishName = parishes.find(p => p._id?.toString() === selectedItem.parishId)?.parishName || 'N/A';
    const fundName = selectedItem.fundId
      ? funds.find(f => f._id?.toString() === selectedItem.fundId)?.fundName || 'N/A'
      : '';
    const categoryName = selectedItem.categoryId
      ? expenseCategories.find(c => c._id?.toString() === selectedItem.categoryId)?.categoryName || 'N/A'
      : '';

    const content = `
════════════════════════════════════════════════════════════════
                    GIÁO PHẬN BUÔN MA THUỘT
                 PHIẾU ${currentReceipt.receiptType === 'income' ? 'THU' : 'CHI'}
                    Số: ${currentReceipt.receiptNo}
════════════════════════════════════════════════════════════════

THÔNG TIN GIAO DỊCH:
--------------------------------------------------------------------
Mã giao dịch:      ${selectedItem.code}
Ngày ${currentReceipt.receiptType === 'income' ? 'thu' : 'chi'}:            ${formatDate(selectedItem.date)}
Ngày lập phiếu:    ${formatDate(currentReceipt.receiptDate)}
Giáo xứ:           ${parishName}
${fundName ? `Quỹ:               ${fundName}` : ''}
${categoryName ? `Danh mục chi:      ${categoryName}` : ''}
${selectedItem.fiscalYear ? `Năm tài chính:     ${selectedItem.fiscalYear}` : ''}
${selectedItem.fiscalPeriod ? `Kỳ tài chính:      Tháng ${selectedItem.fiscalPeriod}` : ''}

════════════════════════════════════════════════════════════════
                    TỔNG TIỀN: ${formatCurrency(currentReceipt.amount)}
                 (${currentReceipt.receiptType === 'income' ? 'Thu vào' : 'Chi ra'})
════════════════════════════════════════════════════════════════

THÔNG TIN CHI TIẾT:
--------------------------------------------------------------------
${currentReceipt.receiptType === 'income' ? 'Người nộp tiền' : 'Người nhận tiền'}:   ${currentReceipt.payerPayee || 'Không có thông tin'}
Hình thức:         ${selectedItem.paymentMethod === 'offline' || selectedItem.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
${selectedItem.bankAccount ? `Tài khoản:         ${selectedItem.bankAccount}` : ''}

${currentReceipt.description ? `
Nội dung:
${currentReceipt.description}
` : ''}

${selectedItem.notes ? `
Ghi chú:
${selectedItem.notes}
` : ''}

${selectedItem.images.length > 0 ? `Hình ảnh đính kèm: ${selectedItem.images.length} file` : ''}

════════════════════════════════════════════════════════════════
                        CHỮ KÝ XÁC NHẬN
--------------------------------------------------------------------

  Người lập phiếu          ${currentReceipt.receiptType === 'income' ? 'Người nộp tiền' : 'Người nhận tiền'}              Cha xứ

  _______________          _______________          _______________
(Ký và ghi rõ họ tên)   (Ký và ghi rõ họ tên)    (Ký và đóng dấu)


════════════════════════════════════════════════════════════════
Phiếu được tạo tự động bởi hệ thống GPBMT.ORG
Ngày in: ${formatDate(new Date())}
════════════════════════════════════════════════════════════════
    `;

    // Tạo blob và download
    const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentReceipt.receiptNo}_${parishName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const openEditDialog = async (item: TransactionItem) => {
    setSelectedItem(item);

    // Fetch full data để lấy categoryId và bankAccount
    try {
      const endpoint = item.type === 'income'
        ? `/api/incomes/${item._id}`
        : `/api/expenses/${item._id}`;
      const response = await fetch(endpoint);

      if (response.ok) {
        const result = await response.json();
        const fullData = result.data;

        setFormData({
          parishId: fullData.parishId?.toString() || '',
          fundId: fullData.fundId?.toString() || '',
          categoryId: fullData.categoryId?.toString() || '',
          amount: fullData.amount.toString(),
          paymentMethod: fullData.paymentMethod,
          bankAccountId: fullData.bankAccountId?.toString() || '',
          payerPayeeName: item.type === 'income' ? (fullData.payerName || '') : (fullData.payeeName || ''),
          description: fullData.description || '',
          transactionDate: new Date(item.type === 'income' ? fullData.incomeDate : fullData.expenseDate).toISOString().split('T')[0],
          images: fullData.images || [],
          notes: fullData.notes || ''
        });
      }
    } catch (error) {
      console.error('Error fetching full data:', error);
      // Fallback to basic data
      setFormData({
        parishId: item.parishId || '',
        fundId: item.fundId || '',
        categoryId: '',
        amount: item.amount.toString(),
        paymentMethod: item.paymentMethod,
        bankAccountId: '',
        payerPayeeName: item.payerPayee || '',
        description: item.description || '',
        transactionDate: new Date(item.date).toISOString().split('T')[0],
        images: item.images || [],
        notes: item.notes || ''
      });
    }

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

  // Filter transactions by search term (client-side)
  const filteredTransactions = transactions.filter(t => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      t.code?.toLowerCase().includes(search) ||
      t.payerPayee?.toLowerCase().includes(search) ||
      t.description?.toLowerCase().includes(search)
    );
  });

  const stats = {
    total: filteredTransactions.length,
    pending: filteredTransactions.filter(t => t.status === 'pending').length,
    approved: filteredTransactions.filter(t => t.status === 'approved').length,
    rejected: filteredTransactions.filter(t => t.status === 'rejected').length,
    totalAmount: filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
  };

  // Multi-select helpers
  const pendingTransactions = filteredTransactions.filter(t => t.status === 'pending');
  const allPendingSelected = pendingTransactions.length > 0 && pendingTransactions.every(t => selectedIds.has(t._id));
  const somePendingSelected = pendingTransactions.some(t => selectedIds.has(t._id));

  const toggleSelectAll = () => {
    if (allPendingSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingTransactions.map(t => t._id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Batch approve selected transactions with combined receipt
  const handleBatchApprove = async (createCombinedReceipt: boolean = true) => {
    if (selectedIds.size === 0) return;

    setBatchProcessing(true);
    try {
      const response = await fetch('/api/transactions/batch-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          type: activeTab,
          createCombinedReceipt
        })
      });

      const result = await response.json();

      if (response.ok) {
        const message = result.message || `Đã duyệt ${result.data?.approvedCount || selectedIds.size} khoản ${activeTab === 'income' ? 'thu' : 'chi'}`;
        alert(message);

        // If a receipt was created, optionally navigate to it
        if (result.data?.receipt?._id) {
          const viewReceipt = confirm('Phiếu đã được tạo. Bạn có muốn xem chi tiết phiếu không?');
          if (viewReceipt) {
            router.push(`/finance/receipts/${result.data.receipt._id}`);
          }
        }

        clearSelection();
        setShowBatchApproveDialog(false);
        fetchData();
      } else {
        alert(`Lỗi: ${result.error || 'Không thể duyệt hàng loạt'}`);
      }
    } catch (error) {
      console.error('Error batch approving:', error);
      alert('Có lỗi xảy ra khi duyệt hàng loạt');
    } finally {
      setBatchProcessing(false);
    }
  };

  // Clear selection when tab changes
  useEffect(() => {
    clearSelection();
  }, [activeTab]);

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
  };

  // Check if any filter is active
  const hasActiveFilters = statusFilter !== 'all' || searchTerm || dateFrom || dateTo;

  // Print receipt function
  const handlePrint = (item: TransactionItem) => {
    setSelectedItem(item);
    fetchReceipt(item._id);
  };

  // Print directly without preview
  const handlePrintDirect = () => {
    window.print();
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
                  {formatCompactCurrency(stats.totalAmount)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader className="space-y-4 pb-4">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {activeTab === 'income' ? 'Danh sách khoản thu' : 'Danh sách khoản chi'}
                  </CardTitle>
                  <CardDescription>
                    Quản lý các giao dịch {activeTab === 'income' ? 'thu' : 'chi'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="income" className="gap-2">
                      <ArrowDownCircle size={16} className="text-green-600" />
                      Khoản thu
                    </TabsTrigger>
                    <TabsTrigger value="expense" className="gap-2">
                      <ArrowUpCircle size={16} className="text-red-600" />
                      Khoản chi
                    </TabsTrigger>
                  </TabsList>
                  <Button
                    variant={showAdvancedFilter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                    className="gap-2"
                  >
                    <Filter size={16} />
                    Bộ lọc
                    {hasActiveFilters && (
                      <Badge className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0">
                        {[statusFilter !== 'all', searchTerm, dateFrom, dateTo].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>

              {/* Advanced Filter Panel */}
              {showAdvancedFilter && (
                <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                      <Filter size={14} />
                      Bộ lọc nâng cao
                    </h4>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={resetFilters} className="text-red-600 hover:text-red-700 h-7 text-xs">
                        <X size={14} className="mr-1" />
                        Xóa bộ lọc
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Tìm kiếm</Label>
                      <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Mã GD, người nộp/nhận..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 h-9"
                        />
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Trạng thái</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value="pending">Chờ duyệt</SelectItem>
                          <SelectItem value="approved">Đã duyệt</SelectItem>
                          <SelectItem value="rejected">Từ chối</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date From */}
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Từ ngày</Label>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="pl-8 h-9"
                        />
                      </div>
                    </div>

                    {/* Date To */}
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Đến ngày</Label>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="pl-8 h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Active filters summary */}
                  {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                      <span className="text-xs text-gray-500">Đang lọc:</span>
                      {statusFilter !== 'all' && (
                        <Badge variant="secondary" className="text-xs">
                          Trạng thái: {statusFilter === 'pending' ? 'Chờ duyệt' : statusFilter === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                          <button onClick={() => setStatusFilter('all')} className="ml-1 hover:text-red-500">×</button>
                        </Badge>
                      )}
                      {searchTerm && (
                        <Badge variant="secondary" className="text-xs">
                          Tìm: "{searchTerm}"
                          <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-red-500">×</button>
                        </Badge>
                      )}
                      {dateFrom && (
                        <Badge variant="secondary" className="text-xs">
                          Từ: {formatDate(dateFrom)}
                          <button onClick={() => setDateFrom('')} className="ml-1 hover:text-red-500">×</button>
                        </Badge>
                      )}
                      {dateTo && (
                        <Badge variant="secondary" className="text-xs">
                          Đến: {formatDate(dateTo)}
                          <button onClick={() => setDateTo('')} className="ml-1 hover:text-red-500">×</button>
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {hasActiveFilters ? (
                    <div>
                      <p className="mb-2">Không tìm thấy giao dịch phù hợp với bộ lọc</p>
                      <Button variant="outline" size="sm" onClick={resetFilters}>
                        Xóa bộ lọc
                      </Button>
                    </div>
                  ) : (
                    'Không có dữ liệu'
                  )}
                </div>
              ) : (
                <>
                  {/* Batch Action Bar */}
                  {selectedIds.size > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckSquare size={18} className="text-blue-600" />
                        <span className="font-medium text-blue-700">
                          Đã chọn {selectedIds.size} khoản {activeTab === 'income' ? 'thu' : 'chi'} đang chờ duyệt
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {(user?.role === 'super_admin' || user?.role === 'cha_quan_ly') && (
                          <Button
                            size="sm"
                            onClick={() => setShowBatchApproveDialog(true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Duyệt {selectedIds.size} khoản
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearSelection}
                        >
                          Bỏ chọn
                        </Button>
                      </div>
                    </div>
                  )}

                  <Table>
                    <TableHeader>
                      <TableRow>
                        {/* Checkbox column for pending items */}
                        <TableHead className="w-[50px]">
                          {pendingTransactions.length > 0 && (user?.role === 'super_admin' || user?.role === 'cha_quan_ly') && (
                            <Checkbox
                              checked={allPendingSelected}
                              onCheckedChange={toggleSelectAll}
                              aria-label="Chọn tất cả"
                            />
                          )}
                        </TableHead>
                        <TableHead>Mã</TableHead>
                        <TableHead>Ngày</TableHead>
                        <TableHead>{activeTab === 'income' ? 'Người nộp' : 'Người nhận'}</TableHead>
                        <TableHead className="text-right">Số tiền</TableHead>
                        {activeTab === 'income' && <TableHead>Nguồn</TableHead>}
                        <TableHead>Hình ảnh</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((item) => (
                        <TableRow key={item._id} className={selectedIds.has(item._id) ? 'bg-blue-50' : ''}>
                          {/* Checkbox for pending items */}
                          <TableCell>
                            {item.status === 'pending' && (user?.role === 'super_admin' || user?.role === 'cha_quan_ly') && (
                              <Checkbox
                                checked={selectedIds.has(item._id)}
                                onCheckedChange={() => toggleSelect(item._id)}
                                aria-label={`Chọn ${item.code}`}
                              />
                            )}
                          </TableCell>
                          <TableCell className="font-mono">{item.code}</TableCell>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>{item.payerPayee || 'N/A'}</TableCell>
                        <TableCell className={`text-right font-semibold ${
                          activeTab === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCompactCurrency(item.amount)}
                        </TableCell>
                        {activeTab === 'income' && (
                          <TableCell>
                            {item.sourceType === 'rental_contract' ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                                <Home size={12} />
                                HĐ Thuê
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 gap-1">
                                <User size={12} />
                                Nhập tay
                              </Badge>
                            )}
                          </TableCell>
                        )}
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
                            {item.status === 'approved' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200 gap-1"
                                onClick={() => {
                                  setSelectedItem(item);
                                  fetchReceipt(item._id);
                                }}
                                disabled={loadingReceipt}
                                title="In phiếu thu/chi"
                              >
                                <Printer size={14} />
                                In phiếu
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    </TableBody>
                  </Table>
                </>
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
                  <Label>Tài khoản ngân hàng {createType === 'income' ? '(nhận tiền)' : '(chi tiền)'}</Label>
                  {bankAccounts.filter(ba =>
                    createType === 'income'
                      ? ba.accountType === 'income' || ba.accountType === 'both'
                      : ba.accountType === 'expense' || ba.accountType === 'both'
                  ).length > 0 ? (
                    <Select
                      value={formData.bankAccountId}
                      onValueChange={(v) => setFormData({ ...formData, bankAccountId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankAccounts
                          .filter(ba =>
                            createType === 'income'
                              ? ba.accountType === 'income' || ba.accountType === 'both'
                              : ba.accountType === 'expense' || ba.accountType === 'both'
                          )
                          .map((ba) => (
                            <SelectItem key={ba._id!.toString()} value={ba._id!.toString()}>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{ba.accountNumber}</span>
                                <span className="text-gray-500">-</span>
                                <span>{ba.bankName}</span>
                                {ba.isDefault && <span className="text-yellow-500">★</span>}
                              </div>
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
            <DialogTitle>
              Sửa {selectedItem?.type === 'income' ? 'khoản thu' : 'khoản chi'}
            </DialogTitle>
            <DialogDescription>
              Chỉ có thể sửa giao dịch đang chờ duyệt
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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
                <Label>{selectedItem?.type === 'income' ? 'Quỹ *' : 'Nguồn quỹ (tùy chọn)'}</Label>
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

              {selectedItem?.type === 'expense' && (
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
                <Label>{selectedItem?.type === 'income' ? 'Người nộp' : 'Người nhận'}</Label>
                <Input
                  placeholder={selectedItem?.type === 'income' ? 'Tên người nộp' : 'Tên người nhận'}
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
                  <Label>Tài khoản ngân hàng {selectedItem?.type === 'income' ? '(nhận tiền)' : '(chi tiền)'}</Label>
                  {bankAccounts.filter(ba =>
                    selectedItem?.type === 'income'
                      ? ba.accountType === 'income' || ba.accountType === 'both'
                      : ba.accountType === 'expense' || ba.accountType === 'both'
                  ).length > 0 ? (
                    <Select
                      value={formData.bankAccountId}
                      onValueChange={(v) => setFormData({ ...formData, bankAccountId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankAccounts.filter(ba =>
                          selectedItem?.type === 'income'
                            ? ba.accountType === 'income' || ba.accountType === 'both'
                            : ba.accountType === 'expense' || ba.accountType === 'both'
                        ).map((ba) => (
                          <SelectItem key={ba._id!.toString()} value={ba._id!.toString()}>
                            {ba.accountNumber} - {ba.bankName} ({ba.accountName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-muted-foreground p-2 border rounded">
                      Chưa có tài khoản ngân hàng phù hợp. <a href="/finance/bank-accounts" className="text-blue-600 hover:underline">Thêm tài khoản</a>
                    </div>
                  )}
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

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <p className="font-medium">{formatDate(selectedForDetail.date)}</p>
                </div>
                {selectedForDetail.submittedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ngày tạo</p>
                    <p className="font-medium">{formatDate(selectedForDetail.submittedAt)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Số tiền</p>
                  <p className={`text-xl font-bold ${selectedForDetail.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedForDetail.type === 'expense' ? '-' : ''}{formatCompactCurrency(selectedForDetail.amount)}
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
                <div>
                  <p className="text-sm font-medium text-gray-500">Trạng thái</p>
                  <StatusBadge status={selectedForDetail.status} variant="sm" />
                </div>
              </div>

              {/* Source Information - for income transparency */}
              {selectedForDetail.type === 'income' && (
                <div className={`p-3 rounded-md ${selectedForDetail.sourceType === 'rental_contract' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <p className="text-sm font-medium text-gray-500 mb-2">Nguồn giao dịch</p>
                  <div className="flex items-center gap-2">
                    {selectedForDetail.sourceType === 'rental_contract' ? (
                      <>
                        <Badge className="bg-blue-100 text-blue-700 gap-1">
                          <Home size={14} />
                          Hợp đồng thuê BĐS
                        </Badge>
                        <span className="text-sm text-blue-700">
                          - Phát sinh từ hợp đồng cho thuê bất động sản
                        </span>
                      </>
                    ) : (
                      <>
                        <Badge className="bg-gray-100 text-gray-700 gap-1">
                          <User size={14} />
                          Nhập tay
                        </Badge>
                        <span className="text-sm text-gray-600">
                          - Giao dịch được tạo thủ công
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

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
                          setSelectedItem(selectedForDetail);
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
            {selectedForDetail?.status === 'pending' && (user?.role === 'super_admin' || user?.role === 'cha_quan_ly') && (
              <>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    setSelectedForReject(selectedForDetail);
                    setRejectNote('');
                    setShowRejectDialog(true);
                  }}
                  disabled={submitting}
                >
                  <XCircle size={16} className="mr-2" />
                  Từ chối
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setSelectedForApprove(selectedForDetail);
                    setApproveNote('');
                    setShowApproveDialog(true);
                  }}
                  disabled={submitting}
                >
                  <CheckCircle size={16} className="mr-2" />
                  Duyệt
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
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
                {selectedForReject && formatCompactCurrency(selectedForReject.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Lý do từ chối *</p>
              <Textarea
                placeholder="Nhập lý do từ chối..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={4}
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
              disabled={submitting || !rejectNote.trim()}
            >
              {submitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt giao dịch</DialogTitle>
            <DialogDescription>
              Giao dịch: {selectedForApprove?.code}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Số tiền</p>
              <p className="font-semibold">
                {selectedForApprove && formatCompactCurrency(selectedForApprove.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Lý do duyệt *</p>
              <Textarea
                placeholder="Nhập lý do duyệt hoặc ghi chú xác nhận..."
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false);
                setSelectedForApprove(null);
                setApproveNote('');
              }}
            >
              Hủy
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={submitting || !approveNote.trim()}
            >
              {submitting ? 'Đang xử lý...' : 'Xác nhận duyệt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Viewer Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="border-b pb-6">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">GIÁO PHẬN BUÔN MA THUỘT</div>
              <DialogTitle className="text-2xl font-bold text-blue-900 mb-2">
                PHIẾU {currentReceipt?.receiptType === 'income' ? 'THU' : 'CHI'}
              </DialogTitle>
              <DialogDescription className="text-base font-semibold">
                Số: {currentReceipt?.receiptNo}
              </DialogDescription>
              <div className="text-sm text-gray-500 mt-2">
                Ngày lập: {currentReceipt && formatDate(currentReceipt.receiptDate)}
              </div>
            </div>
          </DialogHeader>

          {currentReceipt && selectedItem && (
            <div className="space-y-8 p-6">
              {/* Thông tin giao dịch */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-base">
                  <FileText size={18} />
                  Thông tin giao dịch
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mã giao dịch</p>
                    <p className="font-bold font-mono text-blue-900 text-sm">{selectedItem.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ngày {currentReceipt.receiptType === 'income' ? 'thu' : 'chi'}</p>
                    <p className="font-semibold text-sm">{formatDate(selectedItem.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Giáo xứ</p>
                    <p className="font-semibold text-sm">
                      {parishes.find(p => p._id?.toString() === selectedItem.parishId)?.parishName || 'N/A'}
                    </p>
                  </div>
                  {selectedItem.fundId && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Quỹ</p>
                      <p className="font-semibold text-sm">
                        {funds.find(f => f._id?.toString() === selectedItem.fundId)?.fundName || 'N/A'}
                      </p>
                    </div>
                  )}
                  {selectedItem.categoryId && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Danh mục chi</p>
                      <p className="font-semibold text-sm">
                        {expenseCategories.find(c => c._id?.toString() === selectedItem.categoryId)?.categoryName || 'N/A'}
                      </p>
                    </div>
                  )}
                  {selectedItem.fiscalYear && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Năm tài chính</p>
                        <p className="font-semibold text-sm">{selectedItem.fiscalYear}</p>
                      </div>
                      {selectedItem.fiscalPeriod && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Kỳ tài chính</p>
                          <p className="font-semibold text-sm">Tháng {selectedItem.fiscalPeriod}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Số tiền - Nổi bật */}
              <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-gray-700 mb-3 font-semibold">TỔNG TIỀN</p>
                <p className={`text-4xl font-bold mb-2 ${currentReceipt.receiptType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(currentReceipt.amount)}
                </p>
                <p className="text-sm text-gray-600 mt-3">
                  ({currentReceipt.receiptType === 'income' ? 'Thu vào' : 'Chi ra'})
                </p>
              </div>

              {/* Thông tin người liên quan */}
              <div className="grid grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-2">
                    {currentReceipt.receiptType === 'income' ? '👤 Người nộp tiền' : '👤 Người nhận tiền'}
                  </p>
                  <p className="font-bold text-lg">{currentReceipt.payerPayee || 'Không có thông tin'}</p>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-2">💳 Hình thức thanh toán</p>
                  <p className="font-semibold text-lg capitalize">
                    {selectedItem.paymentMethod === 'offline' || selectedItem.paymentMethod === 'cash'
                      ? 'Tiền mặt'
                      : 'Chuyển khoản'}
                  </p>
                </div>
              </div>

              {/* Tài khoản ngân hàng */}
              {selectedItem.bankAccount && (
                <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                  <p className="text-sm text-gray-600 mb-2">🏦 Tài khoản ngân hàng</p>
                  <p className="font-bold font-mono text-lg text-green-700">{selectedItem.bankAccount}</p>
                </div>
              )}

              {/* Nội dung/Diễn giải */}
              {currentReceipt.description && (
                <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                  <p className="text-sm text-gray-600 mb-3 font-semibold">📝 Nội dung chi tiết</p>
                  <p className="text-base leading-relaxed">{currentReceipt.description}</p>
                </div>
              )}

              {/* Ghi chú */}
              {selectedItem.notes && (
                <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                  <p className="text-sm text-gray-600 mb-3 font-semibold">📌 Ghi chú</p>
                  <p className="text-sm italic">{selectedItem.notes}</p>
                </div>
              )}

              {/* Hình ảnh chứng từ */}
              {selectedItem.images && selectedItem.images.length > 0 && (
                <div className="border-t pt-6">
                  <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    📷 Hình ảnh chứng từ đính kèm ({selectedItem.images.length} ảnh)
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedItem.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Chứng từ ${idx + 1}`}
                          className="w-full h-40 object-cover rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
                          onClick={() => {
                            setShowReceiptDialog(false);
                            setShowGallery(true);
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                          <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Thông tin xác thực */}
              <div className="border-t-2 border-gray-300 pt-6 mt-8">
                <div className="grid grid-cols-3 gap-8 text-sm text-gray-600">
                  <div className="text-center">
                    <p className="font-semibold mb-2 text-sm">Người lập phiếu</p>
                    <div className="h-20 border-b border-gray-400 mb-2"></div>
                    <p className="italic">(Ký và ghi rõ họ tên)</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold mb-2 text-sm">
                      {currentReceipt.receiptType === 'income' ? 'Người nộp tiền' : 'Người nhận tiền'}
                    </p>
                    <div className="h-20 border-b border-gray-400 mb-2"></div>
                    <p className="italic">(Ký và ghi rõ họ tên)</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold mb-2 text-sm">Cha xứ</p>
                    <div className="h-20 border-b border-gray-400 mb-2"></div>
                    <p className="italic">(Ký và đóng dấu)</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-500 border-t pt-4">
                <p>Phiếu được tạo tự động bởi hệ thống GPBMT.ORG</p>
                <p className="mt-1">Ngày in: {formatDate(new Date())}</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-3 mt-4 print:hidden">
            <Button
              variant="outline"
              onClick={() => {
                setShowReceiptDialog(false);
                setCurrentReceipt(null);
              }}
            >
              Đóng
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
            >
              <Receipt size={16} className="mr-2" />
              Tải xuống TXT
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handlePrintDirect}
            >
              <Printer size={16} className="mr-2" />
              In phiếu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Approve Confirmation Dialog */}
      <Dialog open={showBatchApproveDialog} onOpenChange={setShowBatchApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận duyệt hàng loạt</DialogTitle>
            <DialogDescription>
              Bạn sắp duyệt {selectedIds.size} khoản {activeTab === 'income' ? 'thu' : 'chi'} đang chờ xử lý.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Phiếu tổng hợp:</strong> Hệ thống sẽ tự động tạo <strong>1 phiếu {activeTab === 'income' ? 'thu' : 'chi'} tổng hợp</strong> chứa chi tiết tất cả {selectedIds.size} khoản đã chọn.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Lưu ý:</strong> Hành động này không thể hoàn tác.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Danh sách các khoản được chọn:</p>
              <div className="max-h-40 overflow-y-auto border rounded-lg">
                {filteredTransactions
                  .filter(t => selectedIds.has(t._id))
                  .map(t => (
                    <div key={t._id} className="flex justify-between items-center p-2 border-b last:border-b-0 hover:bg-gray-50">
                      <span className="font-mono text-sm">{t.code}</span>
                      <span className={`font-semibold ${activeTab === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCompactCurrency(t.amount)}
                      </span>
                    </div>
                  ))}
              </div>
              <div className="mt-2 pt-2 border-t flex justify-between items-center">
                <span className="font-medium">Tổng cộng:</span>
                <span className={`font-bold text-lg ${activeTab === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCompactCurrency(
                    filteredTransactions
                      .filter(t => selectedIds.has(t._id))
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBatchApproveDialog(false)}
              disabled={batchProcessing}
            >
              Hủy
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleBatchApprove(true)}
              disabled={batchProcessing}
            >
              {batchProcessing ? (
                <>Đang xử lý...</>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Xác nhận duyệt {selectedIds.size} khoản
                </>
              )}
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
