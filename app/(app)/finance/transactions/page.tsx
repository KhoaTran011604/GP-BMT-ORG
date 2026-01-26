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
import { Plus, ArrowDownCircle, ArrowUpCircle, Printer } from 'lucide-react';
import { ImageGallery } from '@/components/finance/ImageGallery';
import { Fund, Parish, ExpenseCategory, BankAccount } from '@/lib/schemas';
import { useAuth } from '@/lib/auth-context';

import { DateRangePicker } from '@/components/finance/transactions/DateRangePicker';
import { TransactionStats } from '@/components/finance/transactions/TransactionStats';
import { TransactionFilters } from '@/components/finance/transactions/TransactionFilters';
import { TransactionTable, TransactionItem } from '@/components/finance/transactions/TransactionTable';
import { TransactionFormDialog } from '@/components/finance/transactions/TransactionFormDialog';
import { TransactionTypeToggle } from '@/components/finance/transactions/TransactionTypeToggle';
import {
  TransactionDetailDialog,
  ApproveRejectDialog,
  BatchApproveDialog,
} from '@/components/finance/transactions/TransactionDialogs';

type TransactionType = 'income' | 'expense';

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
    bankAccountId: '',
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
      const receiptsRes = await fetch(`/api/receipts`);

      if (receiptsRes.ok) {
        const receiptsResult = await receiptsRes.json();
        const receipt = receiptsResult.data?.find((r: any) => r.referenceId?.toString() === transactionId);

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
          payerPayeeName: item.type === 'income' ? (fullData.payerName || '') : (fullData.payeeName || ''),
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
        payerPayeeName: item.payerPayee || '',
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
      const normalizedMethod = t.paymentMethod === 'cash' ? 'offline' : t.paymentMethod === 'transfer' ? 'online' : t.paymentMethod;
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
          <TransactionStats
            total={stats.total}
            pending={stats.pending}
            approved={stats.approved}
            rejected={stats.rejected}
            totalAmount={stats.totalAmount}
            type={activeTab}
          />

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
                  {/* Date Range Picker - Positioned prominently */}
                  <DateRangePicker
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    onDateFromChange={setDateFrom}
                    onDateToChange={setDateTo}
                    onReset={() => {
                      setDateFrom('');
                      setDateTo('');
                    }}
                  />

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
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <TransactionFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        mode="create"
        transactionType={createType}
        onTypeChange={setCreateType}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleCreate}
        submitting={submitting}
        funds={funds}
        parishes={parishes}
        expenseCategories={expenseCategories}
        bankAccounts={bankAccounts}
      />

      {/* Edit Dialog */}
      <TransactionFormDialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setSelectedItem(null);
            resetForm();
          }
        }}
        mode="edit"
        transactionType={selectedItem?.type || 'income'}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleUpdate}
        submitting={submitting}
        funds={funds}
        parishes={parishes}
        expenseCategories={expenseCategories}
        bankAccounts={bankAccounts}
      />

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
        onConfirm={() => handleBatchApprove(true)}
        processing={batchProcessing}
      />

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
