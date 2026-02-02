'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  FormSection,
  FormField,
  FormLabel,
  FormGrid,
} from '@/components/ui/form-section';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Users, Search, Phone, Building2 } from 'lucide-react';

interface ContactItem {
  _id: string;
  name: string;
  phone?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountNumber?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bankName: '',
    bankBranch: '',
    bankAccountNumber: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contacts');
      if (response.ok) {
        const result = await response.json();
        setContacts(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      bankName: '',
      bankBranch: '',
      bankAccountNumber: '',
    });
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên đối tượng');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim() || undefined,
          bankName: formData.bankName.trim() || undefined,
          bankBranch: formData.bankBranch.trim() || undefined,
          bankAccountNumber: formData.bankAccountNumber.trim() || undefined,
        }),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        resetForm();
        fetchContacts();
        alert('Tạo đối tượng thành công');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể tạo đối tượng'}`);
      }
    } catch (error) {
      console.error('Error creating contact:', error);
      alert('Không thể tạo đối tượng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedContact) return;

    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên đối tượng');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/contacts/${selectedContact._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim() || undefined,
          bankName: formData.bankName.trim() || undefined,
          bankBranch: formData.bankBranch.trim() || undefined,
          bankAccountNumber: formData.bankAccountNumber.trim() || undefined,
        }),
      });

      if (response.ok) {
        setShowEditDialog(false);
        setSelectedContact(null);
        resetForm();
        fetchContacts();
        alert('Cập nhật đối tượng thành công');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể cập nhật'}`);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Không thể cập nhật đối tượng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedContact) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/contacts/${selectedContact._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        setSelectedContact(null);
        fetchContacts();
        alert('Đã vô hiệu hóa đối tượng');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể xóa'}`);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Không thể xóa đối tượng');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (contact: ContactItem) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone || '',
      bankName: contact.bankName || '',
      bankBranch: contact.bankBranch || '',
      bankAccountNumber: contact.bankAccountNumber || '',
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (contact: ContactItem) => {
    setSelectedContact(contact);
    setShowDeleteDialog(true);
  };

  // Filter contacts by search query
  const filteredContacts = contacts.filter((contact) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      (contact.phone && contact.phone.includes(query))
    );
  });

  const stats = {
    total: contacts.length,
    active: contacts.filter((c) => c.status === 'active').length,
    inactive: contacts.filter((c) => c.status === 'inactive').length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Quản lý Đối tượng Nhận gửi</h1>
          <p className="page-description">Danh sách đối tượng nhận/gửi tiền trong giao dịch</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowCreateDialog(true);
          }}
          className="h-12 px-6 text-base font-semibold"
        >
          <Plus size={20} className="mr-2" />
          Thêm đối tượng
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.total}</div>
                <p className="stat-label">Tổng số</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="text-green-600" size={24} />
              </div>
              <div>
                <div className="stat-value text-green-600">{stats.active}</div>
                <p className="stat-label">Đang hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="text-gray-500" size={24} />
              </div>
              <div>
                <div className="stat-value text-gray-500">{stats.inactive}</div>
                <p className="stat-label">Đã vô hiệu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl sm:text-2xl">Danh sách Đối tượng</CardTitle>
            <CardDescription className="text-base mt-1">Quản lý đối tượng nhận/gửi tiền</CardDescription>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Tìm theo tên hoặc SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="empty-state">
              <p className="empty-state-text">Đang tải dữ liệu...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="empty-state">
              <Users size={64} className="mx-auto mb-4 opacity-50" />
              <p className="empty-state-text">{searchQuery ? 'Không tìm thấy đối tượng phù hợp' : 'Chưa có đối tượng nào'}</p>
              {!searchQuery && (
                <Button
                  className="h-12 px-6 text-base font-semibold mt-4"
                  onClick={() => {
                    resetForm();
                    setShowCreateDialog(true);
                  }}
                >
                  Thêm đối tượng đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <Table className="table-lg">
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Ngân hàng</TableHead>
                  <TableHead>Số tài khoản</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact._id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.phone || '-'}</TableCell>
                    <TableCell>
                      {contact.bankName ? (
                        <>
                          <div>{contact.bankName}</div>
                          {contact.bankBranch && (
                            <div className="text-sm text-gray-500">{contact.bankBranch}</div>
                          )}
                        </>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="font-mono">{contact.bankAccountNumber || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          contact.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {contact.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          className="action-btn"
                          onClick={() => openEditDialog(contact)}
                          title="Sửa"
                        >
                          <Pencil />
                        </Button>
                        {contact.status === 'active' && (
                          <Button
                            variant="ghost"
                            className="action-btn text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openDeleteDialog(contact)}
                            title="Vô hiệu hóa"
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Thêm Đối tượng mới</DialogTitle>
            <DialogDescription>Thêm đối tượng nhận/gửi tiền mới</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <FormSection title="Thông tin cơ bản">
              <FormField>
                <FormLabel required>Tên đối tượng</FormLabel>
                <Input
                  placeholder="Nhập tên đối tượng"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  autoFocus
                  className="h-12 text-base"
                />
              </FormField>

              <FormField>
                <FormLabel>Số điện thoại</FormLabel>
                <Input
                  placeholder="Nhập số điện thoại (tùy chọn)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 text-base"
                />
              </FormField>
            </FormSection>

            <FormSection title="Thông tin ngân hàng">
              <FormGrid columns={2}>
                <FormField>
                  <FormLabel>Tên ngân hàng</FormLabel>
                  <Input
                    placeholder="VD: Vietcombank..."
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>
                <FormField>
                  <FormLabel>Chi nhánh</FormLabel>
                  <Input
                    placeholder="VD: BMT"
                    value={formData.bankBranch}
                    onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>
              </FormGrid>

              <FormField>
                <FormLabel>Số tài khoản</FormLabel>
                <Input
                  placeholder="Nhập số tài khoản ngân hàng"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  className="h-12 text-base"
                />
              </FormField>
            </FormSection>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="h-12 px-8 text-base sm:w-auto w-full"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleCreate}
              disabled={submitting}
              className="h-12 px-8 text-base sm:w-auto w-full"
            >
              {submitting ? 'Đang tạo...' : 'Tạo đối tượng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Sửa Đối tượng</DialogTitle>
            <DialogDescription>Cập nhật thông tin đối tượng: {selectedContact?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <FormSection title="Thông tin cơ bản">
              <FormField>
                <FormLabel required>Tên đối tượng</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 text-base"
                />
              </FormField>

              <FormField>
                <FormLabel>Số điện thoại</FormLabel>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 text-base"
                />
              </FormField>
            </FormSection>

            <FormSection title="Thông tin ngân hàng">
              <FormGrid columns={2}>
                <FormField>
                  <FormLabel>Tên ngân hàng</FormLabel>
                  <Input
                    placeholder="VD: Vietcombank..."
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>
                <FormField>
                  <FormLabel>Chi nhánh</FormLabel>
                  <Input
                    placeholder="VD: BMT"
                    value={formData.bankBranch}
                    onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                    className="h-12 text-base"
                  />
                </FormField>
              </FormGrid>

              <FormField>
                <FormLabel>Số tài khoản</FormLabel>
                <Input
                  placeholder="Nhập số tài khoản ngân hàng"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  className="h-12 text-base"
                />
              </FormField>
            </FormSection>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedContact(null);
                resetForm();
              }}
              className="h-12 px-8 text-base sm:w-auto w-full"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={submitting}
              className="h-12 px-8 text-base sm:w-auto w-full"
            >
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Xác nhận vô hiệu hóa</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Bạn có chắc muốn vô hiệu hóa đối tượng <strong>&quot;{selectedContact?.name}&quot;</strong>?
              <br />
              Đối tượng sẽ không còn xuất hiện trong danh sách chọn khi tạo giao dịch mới.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedContact(null);
              }}
              className="h-12 px-6 text-base"
            >
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="h-12 px-6 text-base bg-red-600 hover:bg-red-700"
            >
              {submitting ? 'Đang xử lý...' : 'Vô hiệu hóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
