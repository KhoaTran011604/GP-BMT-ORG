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
                        {transaction.paymentMethod === 'online' && (
                            <>
                                {transaction.type === 'income' && (transaction.senderBankName || transaction.senderBankAccount) && (
                                    <div className="col-span-2 bg-blue-50 p-3 rounded-md">
                                        <p className="text-sm font-medium text-blue-700 mb-1">Thông tin ngân hàng người gửi</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {transaction.senderBankName && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Ngân hàng</p>
                                                    <p className="font-medium">{transaction.senderBankName}</p>
                                                </div>
                                            )}
                                            {transaction.senderBankAccount && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Số tài khoản</p>
                                                    <p className="font-mono font-medium">{transaction.senderBankAccount}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {transaction.type === 'expense' && (transaction.receiverBankName || transaction.receiverBankAccount) && (
                                    <div className="col-span-2 bg-orange-50 p-3 rounded-md">
                                        <p className="text-sm font-medium text-orange-700 mb-1">Thông tin ngân hàng người nhận</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {transaction.receiverBankName && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Ngân hàng</p>
                                                    <p className="font-medium">{transaction.receiverBankName}</p>
                                                </div>
                                            )}
                                            {transaction.receiverBankAccount && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Số tài khoản</p>
                                                    <p className="font-mono font-medium">{transaction.receiverBankAccount}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
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

interface Contact {
    _id: string;
    name: string;
    phone?: string;
    bankName?: string;
    bankAccountNumber?: string;
}

interface BatchApproveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedCount: number;
    transactionType: 'income' | 'expense';
    transactions: TransactionItem[];
    contacts: Contact[];
    onConfirm: () => void;
    processing: boolean;
}

export function BatchApproveDialog({
    open,
    onOpenChange,
    selectedCount,
    transactionType,
    transactions,
    contacts,
    onConfirm,
    processing,
}: BatchApproveDialogProps) {
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Check for invalid online transactions (contact without bank info)
    const invalidTransactions = transactions.filter(t => {
        if (t.paymentMethod !== 'online') return false;

        const contactId = transactionType === 'income' ? t.senderId : t.receiverId;
        if (!contactId) return false;

        const contact = contacts.find(c => c._id === contactId);
        return !contact?.bankAccountNumber;
    });

    const hasInvalidTransactions = invalidTransactions.length > 0;

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
                    {hasInvalidTransactions && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                            <p className="text-sm text-red-800 font-medium mb-2">
                                Không thể duyệt {invalidTransactions.length} khoản sau do phương thức thanh toán chưa khả dụng:
                            </p>
                            <ul className="text-sm text-red-700 list-disc pl-5 space-y-1">
                                {invalidTransactions.map(t => (
                                    <li key={t._id}>
                                        <span className="font-mono">{t.code}</span> - {transactionType === 'income' ? 'Người nộp' : 'Người nhận'} chưa cung cấp tài khoản ngân hàng
                                    </li>
                                ))}
                            </ul>
                            <p className="text-sm text-red-600 mt-2">
                                Vui lòng bỏ chọn các khoản này hoặc cập nhật thông tin ngân hàng cho {transactionType === 'income' ? 'người nộp' : 'người nhận'}.
                            </p>
                        </div>
                    )}

                    {!hasInvalidTransactions && (
                        <>
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Tạo phiếu riêng biệt:</strong> Hệ thống sẽ tự động tạo <strong>{selectedCount} phiếu {transactionType === 'income' ? 'thu' : 'chi'} riêng biệt</strong> (mỗi khoản sẽ có 1 phiếu riêng).
                                </p>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                                <p className="text-sm text-amber-800">
                                    <strong>Lưu ý:</strong> Hành động này không thể hoàn tác.
                                </p>
                            </div>
                        </>
                    )}

                    <div>
                        <p className="text-sm font-medium mb-2">Danh sách các khoản được chọn:</p>
                        <div className="max-h-40 overflow-y-auto border rounded-lg">
                            {transactions.map(t => {
                                const isInvalid = invalidTransactions.some(inv => inv._id === t._id);
                                return (
                                    <div key={t._id} className={`flex justify-between items-center p-2 border-b last:border-b-0 ${isInvalid ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-2">
                                            {isInvalid && <XCircle size={14} className="text-red-500" />}
                                            <span className={`font-mono text-sm ${isInvalid ? 'text-red-600' : ''}`}>{t.code}</span>
                                            {t.paymentMethod === 'online' && (
                                                <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">CK</span>
                                            )}
                                        </div>
                                        <span className={`font-semibold ${transactionType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCompactCurrency(t.amount)}
                                        </span>
                                    </div>
                                );
                            })}
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
                        disabled={processing || hasInvalidTransactions}
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
