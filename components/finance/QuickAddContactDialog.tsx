'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Contact {
  _id: string;
  name: string;
  phone?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountNumber?: string;
}

interface QuickAddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (contact: Contact) => void;
}

export function QuickAddContactDialog({
  open,
  onOpenChange,
  onCreated,
}: QuickAddContactDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Vui lòng nhập tên');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || undefined,
          bankName: bankName.trim() || undefined,
          bankBranch: bankBranch.trim() || undefined,
          bankAccountNumber: bankAccountNumber.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onCreated(data.data);
        // Reset form
        setName('');
        setPhone('');
        setBankName('');
        setBankBranch('');
        setBankAccountNumber('');
        onOpenChange(false);
      } else {
        const data = await res.json();
        setError(data.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tạo đối tượng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setBankName('');
    setBankBranch('');
    setBankAccountNumber('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">Thêm đối tượng mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {error && (
              <div className="text-lg text-red-600 bg-red-50 p-4 rounded-lg font-medium">
                {error}
              </div>
            )}

            {/* Tên - Trường quan trọng nhất */}
            <div className="space-y-3">
              <Label htmlFor="contact-name" className="text-lg font-semibold">
                Tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên đối tượng"
                autoFocus
                className="h-14 text-lg"
              />
            </div>

            {/* Số điện thoại */}
            <div className="space-y-3">
              <Label htmlFor="contact-phone" className="text-lg font-semibold">Số điện thoại</Label>
              <Input
                id="contact-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại (tùy chọn)"
                className="h-14 text-lg"
              />
            </div>

            {/* Thông tin ngân hàng - Layout đơn giản hơn */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold text-gray-700">Thông tin ngân hàng (tùy chọn)</p>

              <div className="space-y-3">
                <Label htmlFor="contact-bank-name" className="text-base font-medium">Tên ngân hàng</Label>
                <Input
                  id="contact-bank-name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="VD: Vietcombank, BIDV, Agribank..."
                  className="h-14 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="contact-bank-branch" className="text-base font-medium">Chi nhánh</Label>
                <Input
                  id="contact-bank-branch"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  placeholder="VD: Chi nhánh Buôn Ma Thuột"
                  className="h-14 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="contact-bank-account" className="text-base font-medium">Số tài khoản</Label>
                <Input
                  id="contact-bank-account"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="Nhập số tài khoản ngân hàng"
                  className="h-14 text-lg font-mono"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="h-14 px-8 text-lg"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={submitting} className="h-14 px-8 text-lg font-semibold">
              {submitting ? 'Đang lưu...' : 'Lưu đối tượng'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
