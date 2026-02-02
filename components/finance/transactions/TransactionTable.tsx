'use client';

import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Pencil,
    Trash2,
    Eye,
    FileText,
    Printer,
    Home,
    User,
    CheckSquare,
    CheckCircle,
} from 'lucide-react';
import { StatusBadge } from '@/components/finance/StatusBadge';
import { formatCompactCurrency } from '@/lib/utils';

export interface TransactionItem {
    _id: string;
    type: 'income' | 'expense';
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
    sourceType?: 'manual' | 'rental_contract';
    rentalContractId?: string;
    // Contact references
    senderId?: string;
    receiverId?: string;
    // Bank info for sender/receiver (online transactions)
    senderBankName?: string;
    senderBankAccount?: string;
    receiverBankName?: string;
    receiverBankAccount?: string;
}

interface TransactionTableProps {
    transactions: TransactionItem[];
    activeTab: 'income' | 'expense';
    loading: boolean;
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: () => void;
    allPendingSelected: boolean;
    pendingCount: number;
    onViewImages: (item: TransactionItem) => void;
    onViewDetail: (item: TransactionItem) => void;
    onEdit: (item: TransactionItem) => void;
    onDelete: (item: TransactionItem) => void;
    onPrint: (item: TransactionItem) => void;
    loadingReceipt: boolean;
    userRole?: string;
    onClearSelection: () => void;
    onBatchApprove: () => void;
    hasActiveFilters: boolean;
    onResetFilters: () => void;
}

export function TransactionTable({
    transactions,
    activeTab,
    loading,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    allPendingSelected,
    pendingCount,
    onViewImages,
    onViewDetail,
    onEdit,
    onDelete,
    onPrint,
    loadingReceipt,
    userRole,
    onClearSelection,
    onBatchApprove,
    hasActiveFilters,
    onResetFilters,
}: TransactionTableProps) {
    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('vi-VN');
    };

    const canManageApprovals = userRole === 'super_admin' || userRole === 'cha_quan_ly';

    if (loading) {
        return (
            <div className="empty-state">
                <p className="empty-state-text">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="empty-state">
                {hasActiveFilters ? (
                    <div>
                        <p className="empty-state-text mb-4">Không tìm thấy giao dịch phù hợp với bộ lọc</p>
                        <Button variant="outline" className="btn-lg" onClick={onResetFilters}>
                            Xóa bộ lọc
                        </Button>
                    </div>
                ) : (
                    <p className="empty-state-text">Không có dữ liệu</p>
                )}
            </div>
        );
    }

    return (
        <>
            {/* Batch Action Bar */}
            {selectedIds.size > 0 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckSquare size={24} className="text-blue-600" />
                        <span className="font-medium text-lg text-blue-700">
                            Đã chọn {selectedIds.size} khoản {activeTab === 'income' ? 'thu' : 'chi'} đang chờ duyệt
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        {canManageApprovals && (
                            <Button
                                onClick={onBatchApprove}
                                className="h-10 px-6 text-base bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle size={20} className="mr-2" />
                                Duyệt {selectedIds.size} khoản
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={onClearSelection}
                            className="h-10 px-6 text-base"
                        >
                            Bỏ chọn
                        </Button>
                    </div>
                </div>
            )}

            <Table className="table-lg">
                <TableHeader>
                    <TableRow>
                        {/* Checkbox column for pending items */}
                        <TableHead className="w-[50px]">
                            {pendingCount > 0 && canManageApprovals && (
                                <Checkbox
                                    checked={allPendingSelected}
                                    onCheckedChange={onToggleSelectAll}
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
                    {transactions.map((item) => (
                        <TableRow key={item._id} className={selectedIds.has(item._id) ? 'bg-blue-50' : ''}>
                            {/* Checkbox for pending items */}
                            <TableCell>
                                {item.status === 'pending' && canManageApprovals && (
                                    <Checkbox
                                        checked={selectedIds.has(item._id)}
                                        onCheckedChange={() => onToggleSelect(item._id)}
                                        aria-label={`Chọn ${item.code}`}
                                    />
                                )}
                            </TableCell>
                            <TableCell className="font-mono">{item.code}</TableCell>
                            <TableCell>{formatDate(item.date)}</TableCell>
                            <TableCell>{item.payerPayee || 'N/A'}</TableCell>
                            <TableCell className={`text-right font-semibold ${activeTab === 'income' ? 'text-green-600' : 'text-red-600'
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
                                        className="action-btn"
                                        onClick={() => onViewImages(item)}
                                        title="Xem ảnh"
                                    >
                                        <Eye />
                                        <span className="ml-1 text-sm">{item.images.length}</span>
                                    </Button>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={item.status} />
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        className="action-btn text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={() => onViewDetail(item)}
                                        title="Chi tiết"
                                    >
                                        <FileText />
                                    </Button>
                                    {item.status === 'pending' && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                className="action-btn"
                                                onClick={() => onEdit(item)}
                                                title="Sửa"
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="action-btn text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => onDelete(item)}
                                                title="Xóa"
                                            >
                                                <Trash2 />
                                            </Button>
                                        </>
                                    )}
                                    {item.status === 'approved' && (
                                        <Button
                                            variant="outline"
                                            className="h-10 px-4 text-base text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200 gap-1"
                                            onClick={() => onPrint(item)}
                                            disabled={loadingReceipt}
                                            title="In phiếu thu/chi"
                                        >
                                            <Printer size={18} />
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
    );
}
