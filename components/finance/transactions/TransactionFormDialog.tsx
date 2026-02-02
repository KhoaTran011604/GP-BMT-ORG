'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { ImageUpload } from '@/components/finance/ImageUpload';
import { ContactCombobox } from '@/components/finance/ContactCombobox';
import { Fund, ExpenseCategory, BankAccount } from '@/lib/schemas';

interface Contact {
    _id: string;
    name: string;
    phone?: string;
}

interface FormData {
    parishId: string;
    fundId: string;
    categoryId: string;
    amount: string;
    paymentMethod: string;
    bankAccountId: string;
    contactId: string;
    payerPayeeName: string;
    description: string;
    transactionDate: string;
    images: string[];
    notes: string;
}

interface TransactionFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit';
    transactionType: 'income' | 'expense';
    onTypeChange?: (type: 'income' | 'expense') => void;
    formData: FormData;
    onFormDataChange: (data: FormData) => void;
    onSubmit: () => void;
    submitting: boolean;
    funds: Fund[];
    expenseCategories: ExpenseCategory[];
    bankAccounts: BankAccount[];
    contacts?: Contact[];
    onCreateNewContact?: () => void;
}

export function TransactionFormDialog({
    open,
    onOpenChange,
    mode,
    transactionType,
    onTypeChange,
    formData,
    onFormDataChange,
    onSubmit,
    submitting,
    funds,
    expenseCategories,
    bankAccounts,
    contacts,
    onCreateNewContact,
}: TransactionFormDialogProps) {
    const updateField = (field: keyof FormData, value: any) => {
        onFormDataChange({ ...formData, [field]: value });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="fullscreen">
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
                        <DialogHeader className="pb-4 border-b">
                            <DialogTitle className="text-2xl font-bold">
                                {mode === 'create' ? 'Tạo' : 'Sửa'} {transactionType === 'income' ? 'khoản thu' : 'khoản chi'} {mode === 'create' ? 'mới' : ''}
                            </DialogTitle>
                            <DialogDescription className="text-base">
                                {mode === 'create' ? 'Điền thông tin để tạo giao dịch mới' : 'Chỉ có thể sửa giao dịch đang chờ duyệt'}
                            </DialogDescription>
                        </DialogHeader>
                        {mode === 'create' && onTypeChange && (
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant={transactionType === 'income' ? 'default' : 'outline'}
                                    onClick={() => onTypeChange('income')}
                                    className="flex-1 gap-3 h-14 text-lg font-semibold"
                                >
                                    <ArrowDownCircle size={24} />
                                    Khoản thu
                                </Button>
                                <Button
                                    type="button"
                                    variant={transactionType === 'expense' ? 'default' : 'outline'}
                                    onClick={() => onTypeChange('expense')}
                                    className="flex-1 gap-3 h-14 text-lg font-semibold"
                                >
                                    <ArrowUpCircle size={24} />
                                    Khoản chi
                                </Button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-base font-semibold">{transactionType === 'income' ? 'Quỹ *' : 'Nguồn quỹ (tùy chọn)'}</Label>
                                <Select
                                    value={formData.fundId}
                                    onValueChange={(v) => updateField('fundId', v)}
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
                            </div>

                            {transactionType === 'expense' && (
                                <div className="space-y-3 md:col-span-2">
                                    <Label className="text-base font-semibold">Danh mục chi</Label>
                                    <Select
                                        value={formData.categoryId}
                                        onValueChange={(v) => updateField('categoryId', v)}
                                    >
                                        <SelectTrigger className="h-14 text-lg">
                                            <SelectValue placeholder="Chọn danh mục chi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {expenseCategories.filter(cat => cat._id).map((cat) => (
                                                <SelectItem key={cat._id!.toString()} value={cat._id!.toString()} className="text-base py-3">
                                                    {cat.categoryCode} - {cat.categoryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label className="text-base font-semibold">Số tiền *</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={formData.amount}
                                    onChange={(e) => updateField('amount', e.target.value)}
                                    className="h-14 text-lg"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-base font-semibold">Ngày giao dịch *</Label>
                                <Input
                                    type="date"
                                    value={formData.transactionDate}
                                    onChange={(e) => updateField('transactionDate', e.target.value)}
                                    className="h-14 text-lg"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-base font-semibold">{transactionType === 'income' ? 'Người gửi (Đối tượng)' : 'Người nhận (Đối tượng)'}</Label>
                                <ContactCombobox
                                    value={formData.contactId}
                                    onChange={(v) => updateField('contactId', v)}
                                    onCreateNew={onCreateNewContact}
                                    contacts={contacts}
                                    placeholder={transactionType === 'income' ? 'Chọn người gửi...' : 'Chọn người nhận...'}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-base font-semibold">Hình thức thanh toán</Label>
                                <Select
                                    value={formData.paymentMethod}
                                    onValueChange={(v) => updateField('paymentMethod', v)}
                                >
                                    <SelectTrigger className="h-14 text-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="offline" className="text-base py-3">Tiền mặt</SelectItem>
                                        <SelectItem value="online" className="text-base py-3">Chuyển khoản</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.paymentMethod === 'online' && (
                                <div className="space-y-3 md:col-span-2">
                                    <Label className="text-base font-semibold">Tài khoản ngân hàng {transactionType === 'income' ? '(nhận tiền)' : '(chi tiền)'}</Label>
                                    {bankAccounts.length > 0 ? (
                                        <Select
                                            value={formData.bankAccountId}
                                            onValueChange={(v) => updateField('bankAccountId', v)}
                                        >
                                            <SelectTrigger className="h-14 text-lg">
                                                <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bankAccounts.map((ba) => (
                                                    <SelectItem key={ba._id!.toString()} value={ba._id!.toString()} className="text-base py-3">
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
                                        <div className="text-base text-gray-500 p-4 border rounded-md bg-gray-50">
                                            Chưa có tài khoản ngân hàng. <a href="/finance/bank-accounts" className="text-blue-600 hover:underline">Thêm tài khoản</a>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-3 md:col-span-2">
                                <Label className="text-base font-semibold">Diễn giải</Label>
                                <Textarea
                                    placeholder="Nội dung giao dịch"
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    className="text-lg min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <Label className="text-base font-semibold">Hình ảnh chứng từ (tối đa 5 ảnh)</Label>
                                <ImageUpload
                                    images={formData.images}
                                    onChange={(imgs) => updateField('images', imgs)}
                                    maxImages={5}
                                />
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <Label className="text-base font-semibold">Ghi chú</Label>
                                <Textarea
                                    placeholder="Ghi chú thêm"
                                    value={formData.notes}
                                    onChange={(e) => updateField('notes', e.target.value)}
                                    className="text-lg min-h-[80px]"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-6 border-t gap-3">
                            <Button variant="outline" onClick={() => onOpenChange(false)} className="h-14 px-8 text-lg">
                                Hủy
                            </Button>
                            <Button onClick={onSubmit} disabled={submitting} className="h-14 px-8 text-lg font-semibold">
                                {submitting ? (mode === 'create' ? 'Đang tạo...' : 'Đang lưu...') : (mode === 'create' ? 'Tạo giao dịch' : 'Lưu thay đổi')}
                            </Button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
