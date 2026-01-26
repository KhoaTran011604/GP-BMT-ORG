'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    CheckCircle,
    XCircle,
    Home,
    User,
} from 'lucide-react';
import { StatusBadge } from '@/components/finance/StatusBadge';
import { formatCompactCurrency } from '@/lib/utils';
import { TransactionItem } from './TransactionTable';

interface TransactionDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: TransactionItem | null;
    onApprove?: () => void;
    onReject?: () => void;
    onViewImages?: () => void;
    canManageApprovals?: boolean;
    submitting?: boolean;
}

export function TransactionDetailDialog({
    open,
    onOpenChange,
    transaction,
    onApprove,
    onReject,
    onViewImages,
    canManageApprovals = false,
    submitting = false,
}: TransactionDetailDialogProps) {
    if (!transaction) return null;

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('vi-VN');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {transaction.type === 'income' ? (
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
                        Mã: {transaction.code}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Ngày {transaction.type === 'income' ? 'thu' : 'chi'}</p>
                            <p className="font-medium">{formatDate(transaction.date)}</p>
                        </div>
                        {transaction.submittedAt && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Ngày tạo</p>
                                <p className="font-medium">{formatDate(transaction.submittedAt)}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-gray-500">Số tiền</p>
                            <p className={`text-xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.type === 'expense' ? '-' : ''}{formatCompactCurrency(transaction.amount)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Hình thức thanh toán</p>
                            <p className="font-medium capitalize">{transaction.paymentMethod}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                {transaction.type === 'income' ? 'Người nộp' : 'Người nhận'}
                            </p>
                            <p className="font-medium">{transaction.payerPayee || 'N/A'}</p>
                        </div>
                        {transaction.bankAccount && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Tài khoản ngân hàng</p>
                                <p className="font-medium">{transaction.bankAccount}</p>
                            </div>
                        )}
                        {transaction.fiscalYear && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Năm tài chính</p>
                                <p className="font-medium">{transaction.fiscalYear}</p>
                            </div>
                        )}
                        {transaction.fiscalPeriod && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Kỳ tài chính</p>
                                <p className="font-medium">Tháng {transaction.fiscalPeriod}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-gray-500">Trạng thái</p>
                            <StatusBadge status={transaction.status} variant="sm" />
                        </div>
                    </div>

                    {/* Source Information - for income transparency */}
                    {transaction.type === 'income' && (
                        <div className={`p-3 rounded-md ${transaction.sourceType === 'rental_contract' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
                            <p className="text-sm font-medium text-gray-500 mb-2">Nguồn giao dịch</p>
                            <div className="flex items-center gap-2">
                                {transaction.sourceType === 'rental_contract' ? (
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

                    {transaction.description && (
                        <div>
                            <p className="text-sm font-medium text-gray-500">Diễn giải</p>
                            <p className="font-medium bg-gray-50 p-3 rounded-md">{transaction.description}</p>
                        </div>
                    )}

                    {transaction.notes && (
                        <div>
                            <p className="text-sm font-medium text-gray-500">Ghi chú</p>
                            <p className="font-medium bg-gray-50 p-3 rounded-md">{transaction.notes}</p>
                        </div>
                    )}

                    {transaction.images.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-2">Hình ảnh chứng từ ({transaction.images.length})</p>
                            <div className="grid grid-cols-4 gap-2">
                                {transaction.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`Chứng từ ${idx + 1}`}
                                        className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={onViewImages}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Đóng
                    </Button>
                    {transaction.status === 'pending' && canManageApprovals && (
                        <>
                            <Button
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={onReject}
                                disabled={submitting}
                            >
                                <XCircle size={16} className="mr-2" />
                                Từ chối
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={onApprove}
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
    );
}

interface ApproveRejectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'approve' | 'reject';
    transaction: TransactionItem | null;
    note: string;
    onNoteChange: (note: string) => void;
    onConfirm: () => void;
    submitting: boolean;
}

export function ApproveRejectDialog({
    open,
    onOpenChange,
    mode,
    transaction,
    note,
    onNoteChange,
    onConfirm,
    submitting,
}: ApproveRejectDialogProps) {
    if (!transaction) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{mode === 'approve' ? 'Duyệt giao dịch' : 'Từ chối giao dịch'}</DialogTitle>
                    <DialogDescription>
                        Giao dịch: {transaction.code}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-500">Số tiền</p>
                        <p className="font-semibold">
                            {formatCompactCurrency(transaction.amount)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-2">
                            {mode === 'approve' ? 'Lý do duyệt *' : 'Lý do từ chối *'}
                        </p>
                        <Textarea
                            placeholder={mode === 'approve' ? 'Nhập lý do duyệt hoặc ghi chú xác nhận...' : 'Nhập lý do từ chối...'}
                            value={note}
                            onChange={(e) => onNoteChange(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant={mode === 'reject' ? 'destructive' : 'default'}
                        className={mode === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                        onClick={onConfirm}
                        disabled={submitting || !note.trim()}
                    >
                        {submitting ? 'Đang xử lý...' : (mode === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface BatchApproveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedCount: number;
    transactionType: 'income' | 'expense';
    transactions: TransactionItem[];
    onConfirm: () => void;
    processing: boolean;
}

export function BatchApproveDialog({
    open,
    onOpenChange,
    selectedCount,
    transactionType,
    transactions,
    onConfirm,
    processing,
}: BatchApproveDialogProps) {
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Xác nhận duyệt hàng loạt</DialogTitle>
                    <DialogDescription>
                        Bạn sắp duyệt {selectedCount} khoản {transactionType === 'income' ? 'thu' : 'chi'} đang chờ xử lý.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Phiếu tổng hợp:</strong> Hệ thống sẽ tự động tạo <strong>1 phiếu {transactionType === 'income' ? 'thu' : 'chi'} tổng hợp</strong> chứa chi tiết tất cả {selectedCount} khoản đã chọn.
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
                            {transactions.map(t => (
                                <div key={t._id} className="flex justify-between items-center p-2 border-b last:border-b-0 hover:bg-gray-50">
                                    <span className="font-mono text-sm">{t.code}</span>
                                    <span className={`font-semibold ${transactionType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCompactCurrency(t.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 pt-2 border-t flex justify-between items-center">
                            <span className="font-medium">Tổng cộng:</span>
                            <span className={`font-bold text-lg ${transactionType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCompactCurrency(totalAmount)}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                    >
                        Hủy
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={onConfirm}
                        disabled={processing}
                    >
                        {processing ? (
                            <>Đang xử lý...</>
                        ) : (
                            <>
                                <CheckCircle size={16} className="mr-2" />
                                Xác nhận duyệt {selectedCount} khoản
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
