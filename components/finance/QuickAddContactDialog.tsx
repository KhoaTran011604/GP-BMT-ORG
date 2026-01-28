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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm đối tượng mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="contact-name">
                Tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên đối tượng"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Số điện thoại</Label>
              <Input
                id="contact-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại (tùy chọn)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-bank-name">Tên ngân hàng</Label>
                <Input
                  id="contact-bank-name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="VD: Vietcombank..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-bank-branch">Chi nhánh</Label>
                <Input
                  id="contact-bank-branch"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  placeholder="VD: BMT"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-bank-account">Số tài khoản</Label>
              <Input
                id="contact-bank-account"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="Nhập số tài khoản ngân hàng"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
