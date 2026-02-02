'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Plus, ArrowDownCircle, ArrowUpCircle, Printer, RefreshCcw, Eye, Pencil, Trash2 } from 'lucide-react';
import { ImageGallery } from '@/components/finance/ImageGallery';
import { StatusBadge } from '@/components/finance/StatusBadge';
import { ContactCombobox } from '@/components/finance/ContactCombobox';
import { QuickAddContactDialog } from '@/components/finance/QuickAddContactDialog';
import { Fund, Parish, ExpenseCategory, BankAccount, Adjustment } from '@/lib/schemas';
import { useAuth } from '@/lib/auth-context';

import { TransactionStats } from '@/components/finance/transactions/TransactionStats';
import { TransactionFilters } from '@/components/finance/transactions/TransactionFilters';
import { TransactionTable } from '@/components/finance/transactions/TransactionTable';
import { TransactionFormDialog } from '@/components/finance/transactions/TransactionFormDialog';
import { TransactionTypeToggle } from '@/components/finance/transactions/TransactionTypeToggle';
import {
  TransactionDetailDialog,
  ApproveRejectDialog,
  BatchApproveDialog,
} from '@/components/finance/transactions/TransactionDialogs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FormSection,
  FormField,
  FormLabel,
  FormGrid,
} from '@/components/ui/form-section';
import { ImageUpload } from '@/components/finance/ImageUpload';
import { formatCompactCurrency } from '@/lib/utils';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

type TransactionType = 'income' | 'expense' | 'adjustment';

interface AdjustmentItem {
  _id: string;
  adjustmentCode: string;
  parishId: string;
  fundId?: string;
  bankAccountId?: string;
  adjustmentType: 'increase' | 'decrease';
  amount: number;
  description: string;
  adjustmentDate: Date;
  fiscalYear: number;
  fiscalPeriod: number;
  images: string[];
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

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
  // Contact references
  senderId?: string;   // for income
  receiverId?: string; // for expense
  // Bank info for sender/receiver (online transactions)
  senderBankName?: string;
  senderBankAccount?: string;
  receiverBankName?: string;
  receiverBankAccount?: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TransactionType>('income');
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [adjustments, setAdjustments] = useState<AdjustmentItem[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [contacts, setContacts] = useState<{ _id: string; name: string; phone?: string; bankName?: string; bankAccountNumber?: string }[]>([]);
  const [showQuickAddContact, setShowQuickAddContact] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [parishFilter, setParishFilter] = useState('all');
  const [fundFilter, setFundFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [fiscalYearFilter, setFiscalYearFilter] = useState('all');
  const [fiscalPeriodFilter, setFiscalPeriodFilter] = useState('all');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TransactionItem | null>(null);
  const [selectedForDetail, setSelectedForDetail] = useState<TransactionItem | null>(null);
  const [selectedForReject, setSelectedForReject] = useState<TransactionItem | null>(null);
  const [selectedForApprove, setSelectedForApprove] = useState<TransactionItem | null>(null);
  const [createType, setCreateType] = useState<TransactionType>('income');
  const [rejectNote, setRejectNote] = useState('');
  const [approveNote, setApproveNote] = useState('');
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
    contactId: '', // FK to contacts - senderId for income, receiverId for expense
    payerPayeeName: '',
    contactBankName: '', // Bank name of the contact (sender/receiver)
    contactBankAccount: '', // Bank account of the contact (sender/receiver)
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
    images: [] as string[],
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Adjustment-related states
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [showEditAdjustmentDialog, setShowEditAdjustmentDialog] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<AdjustmentItem | null>(null);

  // Delete confirmation dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'transaction' | 'adjustment'; item: TransactionItem | AdjustmentItem } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [adjustmentFormData, setAdjustmentFormData] = useState({
    parishId: '',
    fundId: '',
    bankAccountId: '',
    adjustmentType: 'increase' as 'increase' | 'decrease',
    amount: '',
    description: '',
    adjustmentDate: new Date().toISOString().split('T')[0],
    images: [] as string[],
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter, dateFrom, dateTo, parishFilter, fundFilter, paymentMethodFilter, amountMin, amountMax, fiscalYearFilter, fiscalPeriodFilter, searchTerm]);

  useEffect(() => {
    fetchFundsAndParishes();
  }, []);

  // Set default parishId from user
  useEffect(() => {
    if (user?.parishId) {
      setFormData(prev => ({ ...prev, parishId: user.parishId! }));
      setAdjustmentFormData(prev => ({ ...prev, parishId: user.parishId! }));
    }
  }, [user?.parishId]);

  const fetchFundsAndParishes = async () => {
    try {
      const [fundsRes, parishesRes, categoriesRes, bankAccountsRes, contactsRes] = await Promise.all([
        fetch('/api/funds'),
        fetch('/api/parishes'),
        fetch('/api/expense-categories'),
        fetch('/api/bank-accounts?status=active'),
        fetch('/api/contacts?status=active')
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

      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setContacts(contactsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching funds/parishes/categories:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Handle adjustment tab separately
      if (activeTab === 'adjustment') {
        const params = new URLSearchParams();
        if (dateFrom) {
          params.append('startDate', dateFrom);
        }
        if (dateTo) {
          params.append('endDate', dateTo);
        }
        if (parishFilter !== 'all') {
          params.append('parishId', parishFilter);
        }
        if (fundFilter !== 'all') {
          params.append('fundId', fundFilter);
        }
        if (fiscalYearFilter !== 'all') {
          params.append('fiscalYear', fiscalYearFilter);
        }
        if (fiscalPeriodFilter !== 'all') {
          params.append('fiscalPeriod', fiscalPeriodFilter);
        }
        if (amountMin) {
          params.append('amountMin', amountMin);
        }
        if (amountMax) {
          params.append('amountMax', amountMax);
        }
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        if (paymentMethodFilter !== 'all') {
          params.append('paymentMethod', paymentMethodFilter);
        }

        const response = await fetch(`/api/adjustments?${params}`);
        if (response.ok) {
          const result = await response.json();
          setAdjustments(result.data || []);
        }
        setLoading(false);
        return;
      }

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
      if (parishFilter !== 'all') {
        params.append('parishId', parishFilter);
      }
      if (fundFilter !== 'all') {
        params.append('fundId', fundFilter);
      }
      if (fiscalYearFilter !== 'all') {
        params.append('fiscalYear', fiscalYearFilter);
      }
      if (fiscalPeriodFilter !== 'all') {
        params.append('fiscalPeriod', fiscalPeriodFilter);
      }
      if (paymentMethodFilter !== 'all') {
        params.append('paymentMethod', paymentMethodFilter);
      }
      if (amountMin) {
        params.append('amountMin', amountMin);
      }
      if (amountMax) {
        params.append('amountMax', amountMax);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
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
          sourceType: item.sourceType || 'manual',
          rentalContractId: item.rentalContractId,
          // Contact references
          senderId: item.senderId,
          receiverId: item.receiverId
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
      parishId: user?.parishId || '',
      fundId: '',
      categoryId: '',
      amount: '',
      paymentMethod: 'offline',
      bankAccountId: '',
      contactId: '',
      payerPayeeName: '',
      contactBankName: '',
      contactBankAccount: '',
      description: '',
      transactionDate: new Date().toISOString().split('T')[0],
      images: [],
      notes: ''
    });
  };

  const resetAdjustmentForm = () => {
    setAdjustmentFormData({
      parishId: user?.parishId || '',
      fundId: '',
      bankAccountId: '',
      adjustmentType: 'increase',
      amount: '',
      description: '',
      adjustmentDate: new Date().toISOString().split('T')[0],
      images: [],
      notes: ''
    });
  };

  const handleCreateAdjustment = async () => {
    if (!adjustmentFormData.parishId || !adjustmentFormData.fundId || !adjustmentFormData.amount || !adjustmentFormData.adjustmentDate || !adjustmentFormData.description) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parishId: adjustmentFormData.parishId,
          fundId: adjustmentFormData.fundId || undefined,
          bankAccountId: adjustmentFormData.bankAccountId || undefined,
          adjustmentType: adjustmentFormData.adjustmentType,
          amount: parseFloat(adjustmentFormData.amount),
          description: adjustmentFormData.description,
          adjustmentDate: adjustmentFormData.adjustmentDate,
          paymentMethod: adjustmentFormData.bankAccountId ? 'online' : 'offline',
          images: adjustmentFormData.images,
          notes: adjustmentFormData.notes || undefined
        })
      });

      if (response.ok) {
        setShowAdjustmentDialog(false);
        resetAdjustmentForm();
        fetchData();
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể tạo phiếu điều chỉnh'}`);
      }
    } catch (error) {
      console.error('Error creating adjustment:', error);
      alert('Không thể tạo phiếu điều chỉnh');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAdjustment = async () => {
    if (!selectedAdjustment || !adjustmentFormData.fundId || !adjustmentFormData.amount || !adjustmentFormData.parishId || !adjustmentFormData.adjustmentDate || !adjustmentFormData.description) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/adjustments/${selectedAdjustment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parishId: adjustmentFormData.parishId,
          fundId: adjustmentFormData.fundId || undefined,
          bankAccountId: adjustmentFormData.bankAccountId || undefined,
          adjustmentType: adjustmentFormData.adjustmentType,
          amount: parseFloat(adjustmentFormData.amount),
          description: adjustmentFormData.description,
          adjustmentDate: adjustmentFormData.adjustmentDate,
          paymentMethod: adjustmentFormData.bankAccountId ? 'online' : 'offline',
          images: adjustmentFormData.images,
          notes: adjustmentFormData.notes || undefined
        })
      });

      if (response.ok) {
        setShowEditAdjustmentDialog(false);
        setSelectedAdjustment(null);
        resetAdjustmentForm();
        fetchData();
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể cập nhật'}`);
      }
    } catch (error) {
      console.error('Error updating adjustment:', error);
      alert('Không thể cập nhật phiếu điều chỉnh');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdjustment = (item: AdjustmentItem) => {
    setDeleteTarget({ type: 'adjustment', item });
    setShowDeleteDialog(true);
  };

  const openEditAdjustmentDialog = (item: AdjustmentItem) => {
    setSelectedAdjustment(item);
    setAdjustmentFormData({
      parishId: item.parishId || '',
      fundId: item.fundId || '',
      bankAccountId: item.bankAccountId || '',
      adjustmentType: item.adjustmentType,
      amount: item.amount.toString(),
      description: item.description || '',
      adjustmentDate: new Date(item.adjustmentDate).toISOString().split('T')[0],
      images: item.images || [],
      notes: item.notes || ''
    });
    setShowEditAdjustmentDialog(true);
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
      const selectedBankAccount = formData.bankAccountId
        ? bankAccounts.find(ba => ba._id?.toString() === formData.bankAccountId)
        : null;
      const bankAccountDisplay = selectedBankAccount
        ? `${selectedBankAccount.accountNumber} - ${selectedBankAccount.bankName}`
        : undefined;

      // Get selected contact name
      const selectedContact = formData.contactId
        ? contacts.find(c => c._id === formData.contactId)
        : null;
      const contactName = selectedContact?.name || formData.payerPayeeName || undefined;

      const body = createType === 'income' ? {
        parishId: formData.parishId,
        fundId: formData.fundId,
        categoryId: formData.categoryId || undefined,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        bankAccountId: formData.bankAccountId || undefined,
        bankAccount: bankAccountDisplay,
        senderId: formData.contactId || undefined,
        payerName: contactName,
        senderBankName: formData.paymentMethod === 'online' ? (formData.contactBankName || undefined) : undefined,
        senderBankAccount: formData.paymentMethod === 'online' ? (formData.contactBankAccount || undefined) : undefined,
        description: formData.description || undefined,
        incomeDate: formData.transactionDate,
        images: formData.images,
        notes: formData.notes || undefined
      } : {
        parishId: formData.parishId,
        categoryId: formData.categoryId || undefined,
        fundId: formData.fundId || undefined,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod === 'offline' ? 'offline' : 'online',
        bankAccountId: formData.bankAccountId || undefined,
        bankAccount: bankAccountDisplay,
        receiverId: formData.contactId || undefined,
        payeeName: contactName,
        receiverBankName: formData.paymentMethod === 'online' ? (formData.contactBankName || undefined) : undefined,
        receiverBankAccount: formData.paymentMethod === 'online' ? (formData.contactBankAccount || undefined) : undefined,
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

      const selectedBankAccount = formData.bankAccountId
        ? bankAccounts.find(ba => ba._id?.toString() === formData.bankAccountId)
        : null;
      const bankAccountDisplay = selectedBankAccount
        ? `${selectedBankAccount.accountNumber} - ${selectedBankAccount.bankName}`
        : undefined;

      // Get selected contact name
      const selectedContact = formData.contactId
        ? contacts.find(c => c._id === formData.contactId)
        : null;
      const contactName = selectedContact?.name || formData.payerPayeeName || undefined;

      // Clear bank info if payment method is offline
      const isOffline = formData.paymentMethod === 'offline';

      const body = selectedItem.type === 'income' ? {
        parishId: formData.parishId,
        fundId: formData.fundId,
        categoryId: formData.categoryId || undefined,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        bankAccountId: isOffline ? null : (formData.bankAccountId || undefined),
        bankAccount: isOffline ? null : bankAccountDisplay,
        senderId: formData.contactId || undefined,
        payerName: contactName,
        senderBankName: isOffline ? null : (formData.contactBankName || undefined),
        senderBankAccount: isOffline ? null : (formData.contactBankAccount || undefined),
        description: formData.description || undefined,
        incomeDate: formData.transactionDate,
        images: formData.images,
        notes: formData.notes || undefined
      } : {
        parishId: formData.parishId,
        categoryId: formData.categoryId || undefined,
        fundId: formData.fundId || undefined,
        amount: parseFloat(formData.amount),
        paymentMethod: isOffline ? 'offline' : 'online',
        bankAccountId: isOffline ? null : (formData.bankAccountId || undefined),
        bankAccount: isOffline ? null : bankAccountDisplay,
        receiverId: formData.contactId || undefined,
        payeeName: contactName,
        receiverBankName: isOffline ? null : (formData.contactBankName || undefined),
        receiverBankAccount: isOffline ? null : (formData.contactBankAccount || undefined),
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

  const handleDelete = (item: TransactionItem) => {
    if (item.status !== 'pending') {
      alert('Chỉ có thể xóa giao dịch đang chờ duyệt');
      return;
    }

    setDeleteTarget({ type: 'transaction', item });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      let endpoint = '';
      if (deleteTarget.type === 'adjustment') {
        endpoint = `/api/adjustments/${deleteTarget.item._id}`;
      } else {
        const item = deleteTarget.item as TransactionItem;
        endpoint = item.type === 'income'
          ? `/api/incomes/${item._id}`
          : `/api/expenses/${item._id}`;
      }

      const response = await fetch(endpoint, { method: 'DELETE' });

      if (response.ok) {
        setShowDeleteDialog(false);
        setDeleteTarget(null);
        fetchData();
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể xóa'}`);
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Không thể xóa');
    } finally {
      setDeleting(false);
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
      // Fetch receipt with referenceId matching transaction ID
      const receiptsRes = await fetch(`/api/receipts?referenceId=${transactionId}`);

      if (receiptsRes.ok) {
        const receiptsResult = await receiptsRes.json();
        const receipt = receiptsResult.data?.[0];

        if (receipt) {
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

  const openEditDialog = async (item: TransactionItem) => {
    setSelectedItem(item);

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
          contactId: item.type === 'income' ? (fullData.senderId?.toString() || '') : (fullData.receiverId?.toString() || ''),
          payerPayeeName: item.type === 'income' ? (fullData.payerName || '') : (fullData.payeeName || ''),
          contactBankName: item.type === 'income' ? (fullData.senderBankName || '') : (fullData.receiverBankName || ''),
          contactBankAccount: item.type === 'income' ? (fullData.senderBankAccount || '') : (fullData.receiverBankAccount || ''),
          description: fullData.description || '',
          transactionDate: new Date(item.type === 'income' ? fullData.incomeDate : fullData.expenseDate).toISOString().split('T')[0],
          images: fullData.images || [],
          notes: fullData.notes || ''
        });
      }
    } catch (error) {
      console.error('Error fetching full data:', error);
      setFormData({
        parishId: item.parishId || '',
        fundId: item.fundId || '',
        categoryId: '',
        amount: item.amount.toString(),
        paymentMethod: item.paymentMethod,
        bankAccountId: '',
        contactId: item.type === 'income' ? (item.senderId || '') : (item.receiverId || ''),
        payerPayeeName: item.payerPayee || '',
        contactBankName: item.type === 'income' ? (item.senderBankName || '') : (item.receiverBankName || ''),
        contactBankAccount: item.type === 'income' ? (item.senderBankAccount || '') : (item.receiverBankAccount || ''),
        description: item.description || '',
        transactionDate: new Date(item.date).toISOString().split('T')[0],
        images: item.images || [],
        notes: item.notes || ''
      });
    }

    setShowEditDialog(true);
  };

  // Filter transactions (client-side)
  const filteredTransactions = transactions.filter(t => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        t.code?.toLowerCase().includes(search) ||
        t.payerPayee?.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Parish filter
    if (parishFilter !== 'all' && t.parishId !== parishFilter) {
      return false;
    }

    // Fund filter
    if (fundFilter !== 'all' && t.fundId !== fundFilter) {
      return false;
    }

    // Payment method filter
    if (paymentMethodFilter !== 'all') {
      const normalizedMethod = t.paymentMethod === 'offline' ? 'offline' : t.paymentMethod === 'online' ? 'online' : t.paymentMethod;
      if (normalizedMethod !== paymentMethodFilter) {
        return false;
      }
    }

    // Amount range filter
    if (amountMin && t.amount < parseFloat(amountMin)) {
      return false;
    }
    if (amountMax && t.amount > parseFloat(amountMax)) {
      return false;
    }

    // Fiscal year filter
    if (fiscalYearFilter !== 'all' && t.fiscalYear?.toString() !== fiscalYearFilter) {
      return false;
    }

    // Fiscal period filter
    if (fiscalPeriodFilter !== 'all' && t.fiscalPeriod?.toString() !== fiscalPeriodFilter) {
      return false;
    }

    return true;
  });

  const stats = {
    total: filteredTransactions.length,
    pending: filteredTransactions.filter(t => t.status === 'pending').length,
    approved: filteredTransactions.filter(t => t.status === 'approved').length,
    rejected: filteredTransactions.filter(t => t.status === 'rejected').length,
    totalAmount: filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
  };

  // Filter adjustments (client-side)
  const filteredAdjustments = adjustments.filter(a => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        a.adjustmentCode?.toLowerCase().includes(search) ||
        a.description?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Parish filter
    if (parishFilter !== 'all' && a.parishId !== parishFilter) {
      return false;
    }

    // Fund filter
    if (fundFilter !== 'all' && a.fundId !== fundFilter) {
      return false;
    }

    // Amount range filter
    if (amountMin && a.amount < parseFloat(amountMin)) {
      return false;
    }
    if (amountMax && a.amount > parseFloat(amountMax)) {
      return false;
    }

    // Fiscal year filter
    if (fiscalYearFilter !== 'all' && a.fiscalYear?.toString() !== fiscalYearFilter) {
      return false;
    }

    // Fiscal period filter
    if (fiscalPeriodFilter !== 'all' && a.fiscalPeriod?.toString() !== fiscalPeriodFilter) {
      return false;
    }

    return true;
  });

  const adjustmentStats = {
    total: filteredAdjustments.length,
    increase: filteredAdjustments.filter(a => a.adjustmentType === 'increase').length,
    decrease: filteredAdjustments.filter(a => a.adjustmentType === 'decrease').length,
    totalIncreaseAmount: filteredAdjustments.filter(a => a.adjustmentType === 'increase').reduce((sum, a) => sum + a.amount, 0),
    totalDecreaseAmount: filteredAdjustments.filter(a => a.adjustmentType === 'decrease').reduce((sum, a) => sum + a.amount, 0)
  };

  // Multi-select helpers
  const pendingTransactions = filteredTransactions.filter(t => t.status === 'pending');
  const allPendingSelected = pendingTransactions.length > 0 && pendingTransactions.every(t => selectedIds.has(t._id));

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
    setParishFilter('all');
    setFundFilter('all');
    setPaymentMethodFilter('all');
    setAmountMin('');
    setAmountMax('');
    setFiscalYearFilter('all');
    setFiscalPeriodFilter('all');
  };

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    statusFilter !== 'all' ||
    searchTerm ||
    dateFrom ||
    dateTo ||
    parishFilter !== 'all' ||
    fundFilter !== 'all' ||
    paymentMethodFilter !== 'all' ||
    amountMin ||
    amountMax ||
    fiscalYearFilter !== 'all' ||
    fiscalPeriodFilter !== 'all'
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Quản lý Giao dịch</h1>
          <p className="page-description">Tạo và quản lý các khoản thu chi{activeTab === 'adjustment' ? ' và điều chỉnh' : ''}</p>
        </div>
        {activeTab === 'adjustment' ? (
          <Button onClick={() => {
            resetAdjustmentForm();
            setShowAdjustmentDialog(true);
          }} className="h-12 px-6 text-base font-semibold">
            <Plus size={20} className="mr-2" />
            Tạo điều chỉnh
          </Button>
        ) : (
          <Button onClick={() => {
            resetForm();
            setCreateType(activeTab as 'income' | 'expense');
            setShowCreateDialog(true);
          }} className="h-12 px-6 text-base font-semibold">
            <Plus size={20} className="mr-2" />
            Tạo giao dịch
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TransactionType)}>
        <TabsContent value={activeTab} className="space-y-4">
          {activeTab !== 'adjustment' ? (
            <TransactionStats
              total={stats.total}
              pending={stats.pending}
              approved={stats.approved}
              rejected={stats.rejected}
              totalAmount={stats.totalAmount}
              type={activeTab}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="stat-card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <RefreshCcw className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <div className="stat-value">{adjustmentStats.total}</div>
                      <p className="stat-label">Tổng phiếu</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="stat-card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <ArrowUpCircle className="text-green-600" size={24} />
                    </div>
                    <div>
                      <div className="stat-value text-green-600">{adjustmentStats.increase}</div>
                      <p className="stat-label">Phiếu tăng</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCompactCurrency(adjustmentStats.totalIncreaseAmount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="stat-card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <ArrowDownCircle className="text-red-600" size={24} />
                    </div>
                    <div>
                      <div className="stat-value text-red-600">{adjustmentStats.decrease}</div>
                      <p className="stat-label">Phiếu giảm</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCompactCurrency(adjustmentStats.totalDecreaseAmount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="stat-card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <RefreshCcw className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <div className={`stat-value ${adjustmentStats.totalIncreaseAmount - adjustmentStats.totalDecreaseAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCompactCurrency(adjustmentStats.totalIncreaseAmount - adjustmentStats.totalDecreaseAmount)}
                      </div>
                      <p className="stat-label">Chênh lệch</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader className="space-y-4 pb-4">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl sm:text-2xl">
                    {activeTab === 'income' ? 'Danh sách khoản thu' : activeTab === 'expense' ? 'Danh sách khoản chi' : 'Danh sách điều chỉnh'}
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    {activeTab === 'adjustment' ? 'Quản lý các phiếu điều chỉnh số dư' : `Quản lý các giao dịch ${activeTab === 'income' ? 'thu' : 'chi'}`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {/* Toggle Switch for Income/Expense */}
                  <TransactionTypeToggle
                    value={activeTab}
                    onChange={(v: TransactionType) => setActiveTab(v)}
                  />

                  <TransactionFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    parishFilter={parishFilter}
                    onParishChange={setParishFilter}
                    fundFilter={fundFilter}
                    onFundChange={setFundFilter}
                    paymentMethodFilter={paymentMethodFilter}
                    onPaymentMethodChange={setPaymentMethodFilter}
                    amountMin={amountMin}
                    onAmountMinChange={setAmountMin}
                    amountMax={amountMax}
                    onAmountMaxChange={setAmountMax}
                    fiscalYearFilter={fiscalYearFilter}
                    onFiscalYearChange={setFiscalYearFilter}
                    fiscalPeriodFilter={fiscalPeriodFilter}
                    onFiscalPeriodChange={setFiscalPeriodFilter}
                    showAdvancedFilter={showAdvancedFilter}
                    onToggleAdvancedFilter={() => setShowAdvancedFilter(!showAdvancedFilter)}
                    onResetFilters={resetFilters}
                    hasActiveFilters={hasActiveFilters}
                    parishes={parishes}
                    funds={funds}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    onDateFromChange={setDateFrom}
                    onDateToChange={setDateTo}
                    onDateReset={() => {
                      setDateFrom('');
                      setDateTo('');
                    }}
                    onApplyFilters={fetchData}
                    activeTab={activeTab}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === 'adjustment' ? (
                // Adjustment Table
                <div className="space-y-4">
                  {loading ? (
                    <div className="empty-state">
                      <p className="empty-state-text">Đang tải dữ liệu...</p>
                    </div>
                  ) : filteredAdjustments.length === 0 ? (
                    <div className="empty-state">
                      <RefreshCcw size={64} className="mx-auto mb-4 opacity-50" />
                      <p className="empty-state-text">
                        {hasActiveFilters ? 'Không tìm thấy phiếu điều chỉnh phù hợp' : 'Chưa có phiếu điều chỉnh nào'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full table-lg">
                        <thead>
                          <tr className="border-b text-left">
                            <th>Mã phiếu</th>
                            <th>Ngày</th>
                            <th>Loại</th>
                            <th>Quỹ/Tài khoản</th>
                            <th className="text-right">Số tiền</th>
                            <th className="text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAdjustments.map((item) => {
                            const fund = funds.find(f => f._id?.toString() === item.fundId);
                            const bankAccount = bankAccounts.find(ba => ba._id?.toString() === item.bankAccountId);
                            return (
                              <tr key={item._id} className="border-b hover:bg-gray-50">
                                <td className="font-mono">{item.adjustmentCode}</td>
                                <td>
                                  {new Date(item.adjustmentDate).toLocaleDateString('vi-VN')}
                                </td>
                                <td>
                                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                                    item.adjustmentType === 'increase'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {item.adjustmentType === 'increase' ? 'Tăng' : 'Giảm'}
                                  </span>
                                </td>
                                <td>
                                  {fund ? fund.fundName : bankAccount ? `${bankAccount.accountNumber} - ${bankAccount.bankName}` : '-'}
                                </td>
                                <td className={`text-right font-semibold ${
                                  item.adjustmentType === 'increase' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {item.adjustmentType === 'increase' ? '+' : '-'}
                                  {formatCompactCurrency(item.amount)}
                                </td>
                                <td className="text-right">
                                  <div className="flex justify-end gap-2">
                                    {item.images && item.images.length > 0 ? (
                                      <Button
                                        variant="ghost"
                                        className="action-btn"
                                        onClick={() => {
                                          setSelectedItem({
                                            _id: item._id,
                                            images: item.images,
                                            type: 'adjustment',
                                            code: item.adjustmentCode,
                                            date: item.adjustmentDate,
                                            amount: item.amount,
                                            payerPayee: '',
                                            paymentMethod: '',
                                            status: 'approved'
                                          } as any);
                                          setShowGallery(true);
                                        }}
                                        title="Xem ảnh"
                                      >
                                        <Eye />
                                      </Button>
                                    ) : null}
                                    <Button
                                      variant="ghost"
                                      className="action-btn"
                                      onClick={() => openEditAdjustmentDialog(item)}
                                      title="Sửa"
                                    >
                                      <Pencil />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      className="action-btn text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleDeleteAdjustment(item)}
                                      title="Xóa"
                                    >
                                      <Trash2 />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <TransactionTable
                  transactions={filteredTransactions}
                  activeTab={activeTab}
                  loading={loading}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  onToggleSelectAll={toggleSelectAll}
                  allPendingSelected={allPendingSelected}
                  pendingCount={pendingTransactions.length}
                  onViewImages={(item) => {
                    setSelectedItem(item);
                    setShowGallery(true);
                  }}
                  onViewDetail={(item) => {
                    setSelectedForDetail(item);
                    setShowDetailDialog(true);
                  }}
                  onEdit={openEditDialog}
                  onDelete={handleDelete}
                  onPrint={(item) => {
                    setSelectedItem(item);
                    fetchReceipt(item._id);
                  }}
                  loadingReceipt={loadingReceipt}
                  userRole={user?.role}
                  onClearSelection={clearSelection}
                  onBatchApprove={() => setShowBatchApproveDialog(true)}
                  hasActiveFilters={hasActiveFilters}
                  onResetFilters={resetFilters}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent size="fullscreen">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-2xl font-bold">
                  Tạo {createType === 'income' ? 'khoản thu' : 'khoản chi'} mới
                </DialogTitle>
                <DialogDescription className="text-base">
                  Điền thông tin để tạo giao dịch mới
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
            {/* Loại giao dịch */}
            <FormSection title="Loại giao dịch">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={createType === 'income' ? 'default' : 'outline'}
                  onClick={() => setCreateType('income')}
                  className="flex-1 gap-3 h-14 text-lg font-semibold"
                >
                  <ArrowDownCircle size={20} />
                  Khoản thu
                </Button>
                <Button
                  type="button"
                  variant={createType === 'expense' ? 'default' : 'outline'}
                  onClick={() => setCreateType('expense')}
                  className="flex-1 gap-3 h-14 text-lg font-semibold"
                >
                  <ArrowUpCircle size={20} />
                  Khoản chi
                </Button>
              </div>
            </FormSection>

            {/* Thông tin giao dịch */}
            <FormSection title="Thông tin giao dịch">
              <FormGrid columns={2}>
                <FormField>
                  <FormLabel required={createType === 'income'}>
                    {createType === 'income' ? 'Quỹ' : 'Nguồn quỹ (tùy chọn)'}
                  </FormLabel>
                  <Select
                    value={formData.fundId}
                    onValueChange={(v) => setFormData({ ...formData, fundId: v })}
                  >
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue placeholder="Chọn quỹ" />
                    </SelectTrigger>
                    <SelectContent>
                      {funds.filter(f => f._id).map((f) => (
                        <SelectItem key={f._id!.toString()} value={f._id!.toString()} className="text-lg py-3">
                          {f.fundName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField>
                  <FormLabel>
                    {createType === 'income' ? 'Danh mục thu' : 'Danh mục chi'}
                  </FormLabel>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                  >
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue placeholder={createType === 'income' ? 'Chọn danh mục thu' : 'Chọn danh mục chi'} />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.filter(cat => cat._id && cat.categoryType === createType).map((cat) => (
                        <SelectItem key={cat._id!.toString()} value={cat._id!.toString()} className="text-lg py-3">
                          {cat.categoryCode} - {cat.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </FormGrid>

              <FormGrid columns={2}>
                <FormField>
                  <FormLabel required>Số tiền</FormLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="h-14 text-lg"
                  />
                </FormField>

                <FormField>
                  <FormLabel required>Ngày giao dịch</FormLabel>
                  <Input
                    type="date"
                    value={formData.transactionDate}
                    onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                    className="h-14 text-lg"
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Đối tượng & Thanh toán */}
            <FormSection title="Đối tượng & Thanh toán">
              <FormField>
                <FormLabel>{createType === 'income' ? 'Người gửi (Đối tượng)' : 'Người nhận (Đối tượng)'}</FormLabel>
                <ContactCombobox
                  value={formData.contactId}
                  onChange={(v) => {
                    const selectedContact = contacts.find(c => c._id === v);
                    const hasBank = selectedContact?.bankAccountNumber;
                    setFormData({
                      ...formData,
                      contactId: v,
                      contactBankName: selectedContact?.bankName || '',
                      contactBankAccount: selectedContact?.bankAccountNumber || '',
                      paymentMethod: (formData.paymentMethod === 'online' && !hasBank) ? 'offline' : formData.paymentMethod
                    });
                  }}
                  onCreateNew={() => setShowQuickAddContact(true)}
                  contacts={contacts}
                  placeholder={createType === 'income' ? 'Chọn người gửi...' : 'Chọn người nhận...'}
                />
              </FormField>

              <FormField>
                <FormLabel>Hình thức thanh toán</FormLabel>
                {(() => {
                  const selectedContact = formData.contactId ? contacts.find(c => c._id === formData.contactId) : null;
                  const contactHasBankInfo = selectedContact && selectedContact.bankAccountNumber;
                  const canSelectOnline = !formData.contactId || contactHasBankInfo;

                  return (
                    <>
                      <Select
                        value={formData.paymentMethod}
                        onValueChange={(v) => {
                          if (v === 'online' && !canSelectOnline) {
                            alert(createType === 'income'
                              ? 'Người gửi chưa cung cấp tài khoản ngân hàng'
                              : 'Người nhận chưa cung cấp tài khoản ngân hàng');
                            return;
                          }
                          if (v === 'offline') {
                            setFormData({
                              ...formData,
                              paymentMethod: v,
                              bankAccountId: '',
                              contactBankName: '',
                              contactBankAccount: ''
                            });
                          } else {
                            setFormData({ ...formData, paymentMethod: v });
                          }
                        }}
                      >
                        <SelectTrigger className="h-14 text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="offline" className="text-lg py-3">Tiền mặt</SelectItem>
                          <SelectItem value="online" disabled={!canSelectOnline} className="text-lg py-3">
                            Chuyển khoản {!canSelectOnline && '(Thiếu TK ngân hàng)'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.contactId && !contactHasBankInfo && (
                        <p className="text-sm text-amber-600 mt-1">
                          {createType === 'income' ? 'Người gửi' : 'Người nhận'} chưa cung cấp tài khoản ngân hàng
                        </p>
                      )}
                    </>
                  );
                })()}
              </FormField>

              {formData.paymentMethod === 'online' && (
                <>
                  <FormField>
                    <FormLabel>Tài khoản ngân hàng {createType === 'income' ? '(nhận tiền)' : '(chi tiền)'}</FormLabel>
                    {bankAccounts.length > 0 ? (
                      <Select
                        value={formData.bankAccountId}
                        onValueChange={(v) => setFormData({ ...formData, bankAccountId: v })}
                      >
                        <SelectTrigger className="h-14 text-lg">
                          <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map((ba) => (
                            <SelectItem key={ba._id!.toString()} value={ba._id!.toString()} className="text-lg py-3">
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
                      <div className="text-base text-gray-500 p-3 border rounded-md bg-gray-50">
                        Chưa có tài khoản ngân hàng. <a href="/finance/bank-accounts" className="text-blue-600 hover:underline">Thêm tài khoản</a>
                      </div>
                    )}
                  </FormField>

                  <FormGrid columns={2}>
                    <FormField>
                      <FormLabel>Ngân hàng {createType === 'income' ? 'người gửi' : 'người nhận'}</FormLabel>
                      <Input
                        placeholder="VD: Vietcombank, BIDV..."
                        value={formData.contactBankName}
                        onChange={(e) => setFormData({ ...formData, contactBankName: e.target.value })}
                        className="h-14 text-lg"
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>STK {createType === 'income' ? 'người gửi' : 'người nhận'}</FormLabel>
                      <Input
                        placeholder="Số tài khoản"
                        value={formData.contactBankAccount}
                        onChange={(e) => setFormData({ ...formData, contactBankAccount: e.target.value })}
                        className="h-14 text-lg"
                      />
                    </FormField>
                  </FormGrid>
                </>
              )}
            </FormSection>

            {/* Nội dung & Chứng từ */}
            <FormSection title="Nội dung & Chứng từ">
              <FormField>
                <FormLabel>Diễn giải</FormLabel>
                <Textarea
                  placeholder="Nội dung giao dịch"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="text-lg min-h-[100px]"
                />
              </FormField>

              <FormField>
                <FormLabel>Hình ảnh chứng từ (tối đa 5 ảnh)</FormLabel>
                <ImageUpload
                  images={formData.images}
                  onChange={(imgs) => setFormData({ ...formData, images: imgs })}
                  maxImages={5}
                />
              </FormField>

              <FormField>
                <FormLabel>Ghi chú</FormLabel>
                <Textarea
                  placeholder="Ghi chú thêm"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="text-lg min-h-[100px]"
                />
              </FormField>
            </FormSection>
              </div>

              <DialogFooter className="pt-6 border-t gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  className="h-14 px-8 text-lg"
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={submitting}
                  className="h-14 px-8 text-lg font-semibold"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo giao dịch'}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent size="fullscreen">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-2xl font-bold">
                  Sửa {selectedItem?.type === 'income' ? 'khoản thu' : 'khoản chi'}
                </DialogTitle>
                <DialogDescription className="text-base">
                  Chỉ có thể sửa giao dịch đang chờ duyệt
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
            {/* Thông tin giao dịch */}
            <FormSection title="Thông tin giao dịch">
              <FormGrid columns={2}>
                <FormField>
                  <FormLabel required={selectedItem?.type === 'income'}>
                    {selectedItem?.type === 'income' ? 'Quỹ' : 'Nguồn quỹ (tùy chọn)'}
                  </FormLabel>
                  <Select
                    value={formData.fundId}
                    onValueChange={(v) => setFormData({ ...formData, fundId: v })}
                  >
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue placeholder="Chọn quỹ" />
                    </SelectTrigger>
                    <SelectContent>
                      {funds.filter(f => f._id).map((f) => (
                        <SelectItem key={f._id!.toString()} value={f._id!.toString()} className="text-lg py-3">
                          {f.fundName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField>
                  <FormLabel>
                    {selectedItem?.type === 'income' ? 'Danh mục thu' : 'Danh mục chi'}
                  </FormLabel>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                  >
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue placeholder={selectedItem?.type === 'income' ? 'Chọn danh mục thu' : 'Chọn danh mục chi'} />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.filter(cat => cat._id && (cat.categoryType === selectedItem?.type || cat._id.toString() === formData.categoryId)).map((cat) => (
                        <SelectItem key={cat._id!.toString()} value={cat._id!.toString()} className="text-lg py-3">
                          {cat.categoryCode} - {cat.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </FormGrid>

              <FormGrid columns={2}>
                <FormField>
                  <FormLabel required>Số tiền</FormLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="h-14 text-lg"
                  />
                </FormField>

                <FormField>
                  <FormLabel required>Ngày giao dịch</FormLabel>
                  <Input
                    type="date"
                    value={formData.transactionDate}
                    onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                    className="h-14 text-lg"
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Đối tượng & Thanh toán */}
            <FormSection title="Đối tượng & Thanh toán">
              <FormField>
                <FormLabel>{selectedItem?.type === 'income' ? 'Người gửi (Đối tượng)' : 'Người nhận (Đối tượng)'}</FormLabel>
                <ContactCombobox
                  value={formData.contactId}
                  onChange={(v) => {
                    const selectedContact = contacts.find(c => c._id === v);
                    const hasBank = selectedContact?.bankAccountNumber;
                    setFormData({
                      ...formData,
                      contactId: v,
                      contactBankName: selectedContact?.bankName || '',
                      contactBankAccount: selectedContact?.bankAccountNumber || '',
                      paymentMethod: (formData.paymentMethod === 'online' && !hasBank) ? 'offline' : formData.paymentMethod
                    });
                  }}
                  onCreateNew={() => setShowQuickAddContact(true)}
                  contacts={contacts}
                  placeholder={selectedItem?.type === 'income' ? 'Chọn người gửi...' : 'Chọn người nhận...'}
                />
              </FormField>

              <FormField>
                <FormLabel>Hình thức thanh toán</FormLabel>
                {(() => {
                  const selectedContact = formData.contactId ? contacts.find(c => c._id === formData.contactId) : null;
                  const contactHasBankInfo = selectedContact && selectedContact.bankAccountNumber;
                  const canSelectOnline = !formData.contactId || contactHasBankInfo;

                  return (
                    <>
                      <Select
                        value={formData.paymentMethod}
                        onValueChange={(v) => {
                          if (v === 'online' && !canSelectOnline) {
                            alert(selectedItem?.type === 'income'
                              ? 'Người gửi chưa cung cấp tài khoản ngân hàng'
                              : 'Người nhận chưa cung cấp tài khoản ngân hàng');
                            return;
                          }
                          if (v === 'offline') {
                            setFormData({
                              ...formData,
                              paymentMethod: v,
                              bankAccountId: '',
                              contactBankName: '',
                              contactBankAccount: ''
                            });
                          } else {
                            setFormData({ ...formData, paymentMethod: v });
                          }
                        }}
                      >
                        <SelectTrigger className="h-14 text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="offline" className="text-lg py-3">Tiền mặt</SelectItem>
                          <SelectItem value="online" disabled={!canSelectOnline} className="text-lg py-3">
                            Chuyển khoản {!canSelectOnline && '(Thiếu TK ngân hàng)'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.contactId && !contactHasBankInfo && (
                        <p className="text-sm text-amber-600 mt-1">
                          {selectedItem?.type === 'income' ? 'Người gửi' : 'Người nhận'} chưa cung cấp tài khoản ngân hàng
                        </p>
                      )}
                    </>
                  );
                })()}
              </FormField>

              {formData.paymentMethod === 'online' && (
                <>
                  <FormField>
                    <FormLabel>Tài khoản ngân hàng {selectedItem?.type === 'income' ? '(nhận tiền)' : '(chi tiền)'}</FormLabel>
                    {bankAccounts.length > 0 ? (
                      <Select
                        value={formData.bankAccountId}
                        onValueChange={(v) => setFormData({ ...formData, bankAccountId: v })}
                      >
                        <SelectTrigger className="h-14 text-lg">
                          <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map((ba) => (
                            <SelectItem key={ba._id!.toString()} value={ba._id!.toString()} className="text-lg py-3">
                              {ba.accountNumber} - {ba.bankName} ({ba.accountName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-base text-muted-foreground p-3 border rounded">
                        Chưa có tài khoản ngân hàng. <a href="/finance/bank-accounts" className="text-blue-600 hover:underline">Thêm tài khoản</a>
                      </div>
                    )}
                  </FormField>

                  <FormGrid columns={2}>
                    <FormField>
                      <FormLabel>Ngân hàng {selectedItem?.type === 'income' ? 'người gửi' : 'người nhận'}</FormLabel>
                      <Input
                        placeholder="VD: Vietcombank, BIDV..."
                        value={formData.contactBankName}
                        onChange={(e) => setFormData({ ...formData, contactBankName: e.target.value })}
                        className="h-14 text-lg"
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>STK {selectedItem?.type === 'income' ? 'người gửi' : 'người nhận'}</FormLabel>
                      <Input
                        placeholder="Số tài khoản"
                        value={formData.contactBankAccount}
                        onChange={(e) => setFormData({ ...formData, contactBankAccount: e.target.value })}
                        className="h-14 text-lg"
                      />
                    </FormField>
                  </FormGrid>
                </>
              )}
            </FormSection>

            {/* Nội dung & Chứng từ */}
            <FormSection title="Nội dung & Chứng từ">
              <FormField>
                <FormLabel>Diễn giải</FormLabel>
                <Textarea
                  placeholder="Nội dung giao dịch"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="text-lg min-h-[100px]"
                />
              </FormField>

              <FormField>
                <FormLabel>Hình ảnh chứng từ (tối đa 5 ảnh)</FormLabel>
                <ImageUpload
                  images={formData.images}
                  onChange={(imgs) => setFormData({ ...formData, images: imgs })}
                  maxImages={5}
                />
              </FormField>

              <FormField>
                <FormLabel>Ghi chú</FormLabel>
                <Textarea
                  placeholder="Ghi chú thêm"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="text-lg min-h-[100px]"
                />
              </FormField>
            </FormSection>
              </div>

              <DialogFooter className="pt-6 border-t gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setSelectedItem(null);
                    resetForm();
                  }}
                  className="h-14 px-8 text-lg"
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={submitting}
                  className="h-14 px-8 text-lg font-semibold"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <TransactionDetailDialog
        open={showDetailDialog}
        onOpenChange={(open) => {
          setShowDetailDialog(open);
          if (!open) setSelectedForDetail(null);
        }}
        transaction={selectedForDetail}
        onApprove={() => {
          setSelectedForApprove(selectedForDetail);
          setApproveNote('');
          setShowApproveDialog(true);
        }}
        onReject={() => {
          setSelectedForReject(selectedForDetail);
          setRejectNote('');
          setShowRejectDialog(true);
        }}
        onViewImages={() => {
          setSelectedItem(selectedForDetail);
          setShowGallery(true);
        }}
        canManageApprovals={user?.role === 'super_admin' || user?.role === 'cha_quan_ly'}
        submitting={submitting}
      />

      {/* Reject Dialog */}
      <ApproveRejectDialog
        open={showRejectDialog}
        onOpenChange={(open) => {
          setShowRejectDialog(open);
          if (!open) {
            setSelectedForReject(null);
            setRejectNote('');
          }
        }}
        mode="reject"
        transaction={selectedForReject}
        note={rejectNote}
        onNoteChange={setRejectNote}
        onConfirm={handleReject}
        submitting={submitting}
      />

      {/* Approve Dialog */}
      <ApproveRejectDialog
        open={showApproveDialog}
        onOpenChange={(open) => {
          setShowApproveDialog(open);
          if (!open) {
            setSelectedForApprove(null);
            setApproveNote('');
          }
        }}
        mode="approve"
        transaction={selectedForApprove}
        note={approveNote}
        onNoteChange={setApproveNote}
        onConfirm={handleApprove}
        submitting={submitting}
      />

      {/* Batch Approve Dialog */}
      <BatchApproveDialog
        open={showBatchApproveDialog}
        onOpenChange={setShowBatchApproveDialog}
        selectedCount={selectedIds.size}
        transactionType={activeTab}
        transactions={filteredTransactions.filter(t => selectedIds.has(t._id))}
        contacts={contacts}
        onConfirm={() => handleBatchApprove(true)}
        processing={batchProcessing}
      />

      {/* Quick Add Contact Dialog */}
      <QuickAddContactDialog
        open={showQuickAddContact}
        onOpenChange={setShowQuickAddContact}
        onCreated={(newContact) => {
          setContacts([...contacts, newContact]);
          setFormData({
            ...formData,
            contactId: newContact._id,
            contactBankName: newContact.bankName || '',
            contactBankAccount: newContact.bankAccountNumber || ''
          });
        }}
      />

      {/* Adjustment Create Dialog */}
      <Dialog open={showAdjustmentDialog} onOpenChange={setShowAdjustmentDialog}>
        <DialogContent size="xl" className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo phiếu điều chỉnh mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo phiếu điều chỉnh số dư
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Loại & Nguồn quỹ */}
            <FormSection title="Loại & Nguồn quỹ">
              <FormGrid columns={2}>
                <FormField>
                  <FormLabel required>Loại điều chỉnh</FormLabel>
                  <Select
                    value={adjustmentFormData.adjustmentType}
                    onValueChange={(v) => setAdjustmentFormData({ ...adjustmentFormData, adjustmentType: v as 'increase' | 'decrease' })}
                  >
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase" className="text-lg py-3">Tăng (+)</SelectItem>
                      <SelectItem value="decrease" className="text-lg py-3">Giảm (-)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField>
                  <FormLabel required>Quỹ</FormLabel>
                  <Select
                    value={adjustmentFormData.fundId}
                    onValueChange={(v) => setAdjustmentFormData({ ...adjustmentFormData, fundId: v })}
                  >
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue placeholder="Chọn quỹ để điều chỉnh" />
                    </SelectTrigger>
                    <SelectContent>
                      {funds.filter(f => f._id).map((f) => (
                        <SelectItem key={f._id!.toString()} value={f._id!.toString()} className="text-lg py-3">
                          {f.fundName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </FormGrid>

              <FormField>
                <FormLabel>Tài khoản ngân hàng (tùy chọn)</FormLabel>
                <Select
                  value={adjustmentFormData.bankAccountId || "__none__"}
                  onValueChange={(v) => setAdjustmentFormData({ ...adjustmentFormData, bankAccountId: v === "__none__" ? "" : v })}
                >
                  <SelectTrigger className="h-14 text-lg">
                    <SelectValue placeholder="Chọn tài khoản để điều chỉnh" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" className="text-lg py-3">-- Không chọn --</SelectItem>
                    {bankAccounts.map((ba) => (
                      <SelectItem key={ba._id!.toString()} value={ba._id!.toString()} className="text-lg py-3">
                        {ba.accountNumber} - {ba.bankName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">Mặc định thanh toán tiền mặt. Chọn tài khoản để chuyển khoản.</p>
              </FormField>
            </FormSection>

            {/* Số tiền & Ngày */}
            <FormSection title="Số tiền & Ngày">
              <FormGrid columns={2}>
                <FormField>
                  <FormLabel required>Số tiền</FormLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    value={adjustmentFormData.amount}
                    onChange={(e) => setAdjustmentFormData({ ...adjustmentFormData, amount: e.target.value })}
                    className="h-14 text-lg"
                  />
                </FormField>

                <FormField>
                  <FormLabel required>Ngày điều chỉnh</FormLabel>
                  <Input
                    type="date"
                    value={adjustmentFormData.adjustmentDate}
                    onChange={(e) => setAdjustmentFormData({ ...adjustmentFormData, adjustmentDate: e.target.value })}
                    className="h-14 text-lg"
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Nội dung & Chứng từ */}
            <FormSection title="Nội dung & Chứng từ">
              <FormField>
                <FormLabel required>Lý do điều chỉnh</FormLabel>
                <Textarea
                  placeholder="Nhập lý do điều chỉnh"
                  value={adjustmentFormData.description}
                  onChange={(e) => setAdjustmentFormData({ ...adjustmentFormData, description: e.target.value })}
                  className="text-lg min-h-[100px]"
                />
              </FormField>

              <FormField>
                <FormLabel>Hình ảnh chứng từ (tối đa 5 ảnh)</FormLabel>
                <ImageUpload
                  images={adjustmentFormData.images}
                  onChange={(imgs) => setAdjustmentFormData({ ...adjustmentFormData, images: imgs })}
                  maxImages={5}
                />
              </FormField>

              <FormField>
                <FormLabel>Ghi chú</FormLabel>
                <Textarea
                  placeholder="Ghi chú thêm"
                  value={adjustmentFormData.notes}
                  onChange={(e) => setAdjustmentFormData({ ...adjustmentFormData, notes: e.target.value })}
                  className="text-lg min-h-[100px]"
                />
              </FormField>
            </FormSection>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdjustmentDialog(false)}
              className="h-12 px-8 text-base sm:w-auto w-full"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleCreateAdjustment}
              disabled={submitting}
              className="h-12 px-8 text-base sm:w-auto w-full"
            >
              {submitting ? 'Đang tạo...' : 'Tạo phiếu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjustment Edit Dialog */}
      <Dialog open={showEditAdjustmentDialog} onOpenChange={setShowEditAdjustmentDialog}>
        <DialogContent size="xl" className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sửa phiếu điều chỉnh</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin phiếu điều chỉnh
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Loại & Nguồn quỹ */}
            <FormSection title="Loại & Nguồn quỹ">
              <FormField>
                <FormLabel required>Giáo xứ</FormLabel>
                <Select
                  value={adjustmentFormData.parishId}
                  onValueChange={(v) => setAdjustmentFormData({ ...adjustmentFormData, parishId: v })}
                >
                  <SelectTrigger className="h-14 text-lg">
                    <SelectValue placeholder="Chọn giáo xứ" />
                  </SelectTrigger>
                  <SelectContent>
                    {parishes.filter(p => p._id).map((p) => (
                      <SelectItem key={p._id!.toString()} value={p._id!.toString()} className="text-lg py-3">
                        {p.parishName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormGrid columns={2}>
                <FormField>
                  <FormLabel required>Loại điều chỉnh</FormLabel>
                  <Select
                    value={adjustmentFormData.adjustmentType}
                    onValueChange={(v) => setAdjustmentFormData({ ...adjustmentFormData, adjustmentType: v as 'increase' | 'decrease' })}
                  >
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase" className="text-lg py-3">Tăng (+)</SelectItem>
                      <SelectItem value="decrease" className="text-lg py-3">Giảm (-)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField>
                  <FormLabel required>Quỹ</FormLabel>
                  <Select
                    value={adjustmentFormData.fundId}
                    onValueChange={(v) => setAdjustmentFormData({ ...adjustmentFormData, fundId: v })}
                  >
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue placeholder="Chọn quỹ để điều chỉnh" />
                    </SelectTrigger>
                    <SelectContent>
                      {funds.filter(f => f._id).map((f) => (
                        <SelectItem key={f._id!.toString()} value={f._id!.toString()} className="text-lg py-3">
                          {f.fundName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </FormGrid>

              <FormField>
                <FormLabel>Tài khoản ngân hàng (tùy chọn)</FormLabel>
                <Select
                  value={adjustmentFormData.bankAccountId || "__none__"}
                  onValueChange={(v) => setAdjustmentFormData({ ...adjustmentFormData, bankAccountId: v === "__none__" ? "" : v })}
                >
                  <SelectTrigger className="h-14 text-lg">
                    <SelectValue placeholder="Chọn tài khoản để điều chỉnh" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" className="text-lg py-3">-- Không chọn --</SelectItem>
                    {bankAccounts.map((ba) => (
                      <SelectItem key={ba._id!.toString()} value={ba._id!.toString()} className="text-lg py-3">
                        {ba.accountNumber} - {ba.bankName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">Mặc định thanh toán tiền mặt. Chọn tài khoản để chuyển khoản.</p>
              </FormField>
            </FormSection>

            {/* Số tiền & Ngày */}
            <FormSection title="Số tiền & Ngày">
              <FormGrid columns={2}>
                <FormField>
                  <FormLabel required>Số tiền</FormLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    value={adjustmentFormData.amount}
                    onChange={(e) => setAdjustmentFormData({ ...adjustmentFormData, amount: e.target.value })}
                    className="h-14 text-lg"
                  />
                </FormField>

                <FormField>
                  <FormLabel required>Ngày điều chỉnh</FormLabel>
                  <Input
                    type="date"
                    value={adjustmentFormData.adjustmentDate}
                    onChange={(e) => setAdjustmentFormData({ ...adjustmentFormData, adjustmentDate: e.target.value })}
                    className="h-14 text-lg"
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Nội dung & Chứng từ */}
            <FormSection title="Nội dung & Chứng từ">
              <FormField>
                <FormLabel required>Lý do điều chỉnh</FormLabel>
                <Textarea
                  placeholder="Nhập lý do điều chỉnh"
                  value={adjustmentFormData.description}
                  onChange={(e) => setAdjustmentFormData({ ...adjustmentFormData, description: e.target.value })}
                  className="text-lg min-h-[100px]"
                />
              </FormField>

              <FormField>
                <FormLabel>Hình ảnh chứng từ (tối đa 5 ảnh)</FormLabel>
                <ImageUpload
                  images={adjustmentFormData.images}
                  onChange={(imgs) => setAdjustmentFormData({ ...adjustmentFormData, images: imgs })}
                  maxImages={5}
                />
              </FormField>

              <FormField>
                <FormLabel>Ghi chú</FormLabel>
                <Textarea
                  placeholder="Ghi chú thêm"
                  value={adjustmentFormData.notes}
                  onChange={(e) => setAdjustmentFormData({ ...adjustmentFormData, notes: e.target.value })}
                  className="text-lg min-h-[100px]"
                />
              </FormField>
            </FormSection>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditAdjustmentDialog(false);
                setSelectedAdjustment(null);
                resetAdjustmentForm();
              }}
              className="h-12 px-8 text-base sm:w-auto w-full"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleUpdateAdjustment}
              disabled={submitting}
              className="h-12 px-8 text-base sm:w-auto w-full"
            >
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
        description={
          deleteTarget?.type === 'adjustment'
            ? 'Bạn có chắc muốn xóa phiếu điều chỉnh này?'
            : 'Bạn có chắc muốn xóa giao dịch này?'
        }
        loading={deleting}
      />
    </div>
  );
}
