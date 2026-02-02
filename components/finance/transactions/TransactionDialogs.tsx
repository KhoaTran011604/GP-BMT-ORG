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

    const paymentMethodLabel = transaction.paymentMethod === 'online' ? 'Chuyển khoản' : 'Tiền mặt';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                {/* Accessible but visually styled header */}
                <DialogHeader className="sr-only">
                    <DialogTitle>
                        Chi tiết {transaction.type === 'income' ? 'khoản thu' : 'khoản chi'} - {transaction.code}
                    </DialogTitle>
                </DialogHeader>

                {/* Visual header with large type indicator */}
                <div className={`p-6 ${transaction.type === 'income' ? 'bg-green-50 border-b-4 border-green-500' : 'bg-red-50 border-b-4 border-red-500'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {transaction.type === 'income' ? (
                                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                                    <ArrowDownCircle size={32} className="text-green-600" />
                                </div>
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                                    <ArrowUpCircle size={32} className="text-red-600" />
                                </div>
                            )}
                            <div>
                                <h2 className={`text-2xl font-bold ${transaction.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                                    {transaction.type === 'income' ? 'KHOẢN THU' : 'KHOẢN CHI'}
                                </h2>
                                <p className="text-lg text-gray-600">Mã: {transaction.code}</p>
                            </div>
                        </div>
                        <StatusBadge status={transaction.status} variant="lg" />
                    </div>
                </div>

                {/* Main content with large fonts */}
                <div className="p-6 space-y-6">
                    {/* Amount - Most important, largest font */}
                    <div className={`text-center p-6 rounded-xl ${transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className="text-lg text-gray-600 mb-2">Số tiền</p>
                        <p className={`text-4xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'expense' ? '-' : '+'}{formatCompactCurrency(transaction.amount)}
                        </p>
                    </div>

                    {/* Key info in large cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-base text-gray-500 mb-1">Ngày {transaction.type === 'income' ? 'thu' : 'chi'}</p>
                            <p className="text-xl font-semibold text-gray-900">{formatDate(transaction.date)}</p>
                        </div>

                        {/* Payment method */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-base text-gray-500 mb-1">Hình thức</p>
                            <p className="text-xl font-semibold text-gray-900">{paymentMethodLabel}</p>
                        </div>

                        {/* Payer/Payee */}
                        <div className="bg-gray-50 p-4 rounded-xl md:col-span-2">
                            <p className="text-base text-gray-500 mb-1">
                                {transaction.type === 'income' ? 'Người nộp tiền' : 'Người nhận tiền'}
                            </p>
                            <p className="text-xl font-semibold text-gray-900">{transaction.payerPayee || 'Không có thông tin'}</p>
                        </div>

                        {/* Bank account if available */}
                        {transaction.bankAccount && (
                            <div className="bg-blue-50 p-4 rounded-xl md:col-span-2">
                                <p className="text-base text-blue-600 mb-1">Tài khoản ngân hàng</p>
                                <p className="text-xl font-semibold text-blue-800">{transaction.bankAccount}</p>
                            </div>
                        )}

                        {/* Bank info for online transactions */}
                        {transaction.paymentMethod === 'online' && (
                            <>
                                {transaction.type === 'income' && (transaction.senderBankName || transaction.senderBankAccount) && (
                                    <div className="bg-blue-50 p-4 rounded-xl md:col-span-2 border-2 border-blue-200">
                                        <p className="text-base font-medium text-blue-700 mb-3">Thông tin ngân hàng người gửi</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {transaction.senderBankName && (
                                                <div>
                                                    <p className="text-base text-gray-500">Ngân hàng</p>
                                                    <p className="text-lg font-semibold">{transaction.senderBankName}</p>
                                                </div>
                                            )}
                                            {transaction.senderBankAccount && (
                                                <div>
                                                    <p className="text-base text-gray-500">Số tài khoản</p>
                                                    <p className="text-lg font-mono font-semibold">{transaction.senderBankAccount}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {transaction.type === 'expense' && (transaction.receiverBankName || transaction.receiverBankAccount) && (
                                    <div className="bg-orange-50 p-4 rounded-xl md:col-span-2 border-2 border-orange-200">
                                        <p className="text-base font-medium text-orange-700 mb-3">Thông tin ngân hàng người nhận</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {transaction.receiverBankName && (
                                                <div>
                                                    <p className="text-base text-gray-500">Ngân hàng</p>
                                                    <p className="text-lg font-semibold">{transaction.receiverBankName}</p>
                                                </div>
                                            )}
                                            {transaction.receiverBankAccount && (
                                                <div>
                                                    <p className="text-base text-gray-500">Số tài khoản</p>
                                                    <p className="text-lg font-mono font-semibold">{transaction.receiverBankAccount}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Description */}
                    {transaction.description && (
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-base text-gray-500 mb-2">Diễn giải</p>
                            <p className="text-lg text-gray-900">{transaction.description}</p>
                        </div>
                    )}

                    {/* Notes */}
                    {transaction.notes && (
                        <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                            <p className="text-base text-yellow-700 mb-2">Ghi chú</p>
                            <p className="text-lg text-gray-900">{transaction.notes}</p>
                        </div>
                    )}

                    {/* Images - larger thumbnails */}
                    {transaction.images.length > 0 && (
                        <div>
                            <p className="text-base text-gray-500 mb-3">Hình ảnh chứng từ ({transaction.images.length} ảnh)</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {transaction.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`Chứng từ ${idx + 1}`}
                                        className="w-full h-32 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity border-2 border-gray-200"
                                        onClick={onViewImages}
                                    />
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                className="w-full mt-3 h-12 text-lg"
                                onClick={onViewImages}
                            >
                                Xem ảnh đầy đủ
                            </Button>
                        </div>
                    )}

                    {/* Source type - simplified */}
                    {transaction.type === 'income' && (
                        <div className={`p-4 rounded-xl ${transaction.sourceType === 'rental_contract' ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-100'}`}>
                            <p className="text-base text-gray-500 mb-2">Nguồn giao dịch</p>
                            <div className="flex items-center gap-3">
                                {transaction.sourceType === 'rental_contract' ? (
                                    <>
                                        <Home size={24} className="text-blue-600" />
                                        <span className="text-lg font-medium text-blue-700">Từ hợp đồng cho thuê BĐS</span>
                                    </>
                                ) : (
                                    <>
                                        <User size={24} className="text-gray-600" />
                                        <span className="text-lg font-medium text-gray-700">Nhập thủ công</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Fiscal info - smaller, less prominent */}
                    {(transaction.fiscalYear || transaction.fiscalPeriod) && (
                        <div className="flex gap-4 text-base text-gray-500">
                            {transaction.fiscalYear && <span>Năm tài chính: {transaction.fiscalYear}</span>}
                            {transaction.fiscalPeriod && <span>• Tháng {transaction.fiscalPeriod}</span>}
                        </div>
                    )}
                </div>

                {/* Footer with large, clear buttons */}
                <div className="p-6 bg-gray-50 border-t space-y-3">
                    {transaction.status === 'pending' && canManageApprovals && (
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <Button
                                variant="outline"
                                className="h-14 text-lg font-semibold text-red-600 border-2 border-red-300 hover:bg-red-50"
                                onClick={onReject}
                                disabled={submitting}
                            >
                                <XCircle size={24} className="mr-2" />
                                Từ chối
                            </Button>
                            <Button
                                className="h-14 text-lg font-semibold bg-green-600 hover:bg-green-700"
                                onClick={onApprove}
                                disabled={submitting}
                            >
                                <CheckCircle size={24} className="mr-2" />
                                Duyệt
                            </Button>
                        </div>
                    )}
                    <Button
                        variant="outline"
                        className="w-full h-14 text-lg font-medium"
                        onClick={() => onOpenChange(false)}
                    >
                        Đóng
                    </Button>
                </div>
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
            <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">Xác nhận duyệt hàng loạt</DialogTitle>
                    <DialogDescription className="text-base">
                        Bạn sắp duyệt {selectedCount} khoản {transactionType === 'income' ? 'thu' : 'chi'} đang chờ xử lý.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {hasInvalidTransactions && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                            <p className="text-base text-red-800 font-medium mb-2">
                                Không thể duyệt {invalidTransactions.length} khoản sau do phương thức thanh toán chưa khả dụng:
                            </p>
                            <ul className="text-base text-red-700 list-disc pl-5 space-y-1">
                                {invalidTransactions.map(t => (
                                    <li key={t._id}>
                                        <span className="font-mono">{t.code}</span> - {transactionType === 'income' ? 'Người nộp' : 'Người nhận'} chưa cung cấp tài khoản ngân hàng
                                    </li>
                                ))}
                            </ul>
                            <p className="text-base text-red-600 mt-2">
                                Vui lòng bỏ chọn các khoản này hoặc cập nhật thông tin ngân hàng cho {transactionType === 'income' ? 'người nộp' : 'người nhận'}.
                            </p>
                        </div>
                    )}

                    {!hasInvalidTransactions && (
                        <>
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                <p className="text-base text-blue-800">
                                    <strong>Tạo phiếu riêng biệt:</strong> Hệ thống sẽ tự động tạo <strong>{selectedCount} phiếu {transactionType === 'income' ? 'thu' : 'chi'} riêng biệt</strong> (mỗi khoản sẽ có 1 phiếu riêng).
                                </p>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                                <p className="text-base text-amber-800">
                                    <strong>Lưu ý:</strong> Hành động này không thể hoàn tác.
                                </p>
                            </div>
                        </>
                    )}

                    <div>
                        <p className="text-base font-medium mb-2">Danh sách các khoản được chọn:</p>
                        <div className="max-h-48 overflow-y-auto border rounded-lg">
                            {transactions.map(t => {
                                const isInvalid = invalidTransactions.some(inv => inv._id === t._id);
                                return (
                                    <div key={t._id} className={`flex justify-between items-center p-3 border-b last:border-b-0 ${isInvalid ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-2">
                                            {isInvalid && <XCircle size={18} className="text-red-500" />}
                                            <span className={`font-mono text-base ${isInvalid ? 'text-red-600' : ''}`}>{t.code}</span>
                                            {t.paymentMethod === 'online' && (
                                                <span className="text-sm text-blue-600 bg-blue-100 px-2 py-0.5 rounded">CK</span>
                                            )}
                                        </div>
                                        <span className={`font-semibold text-base ${transactionType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCompactCurrency(t.amount)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-3 pt-3 border-t flex justify-between items-center">
                            <span className="font-medium text-base">Tổng cộng:</span>
                            <span className={`font-bold text-xl ${transactionType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
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
                        className="h-12 px-8 text-base sm:w-auto w-full"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        className="h-12 px-8 text-base bg-green-600 hover:bg-green-700 sm:w-auto w-full"
                        onClick={onConfirm}
                        disabled={processing || hasInvalidTransactions}
                    >
                        {processing ? (
                            <>Đang xử lý...</>
                        ) : (
                            <>
                                <CheckCircle size={20} className="mr-2" />
                                Xác nhận duyệt {selectedCount} khoản
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
