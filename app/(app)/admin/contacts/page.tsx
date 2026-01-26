'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Users, Search } from 'lucide-react';

interface ContactItem {
  _id: string;
  name: string;
  phone?: string;
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
          <h1 className="text-3xl font-bold">Quản lý Đối tượng Nhận gửi</h1>
          <p className="text-gray-500">Danh sách đối tượng nhận/gửi tiền trong giao dịch</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowCreateDialog(true);
          }}
          className="gap-2"
        >
          <Plus size={18} />
          Thêm đối tượng
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng số</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Đang hoạt động</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Đã vô hiệu</CardDescription>
            <CardTitle className="text-2xl text-gray-500">{stats.inactive}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Danh sách Đối tượng</CardTitle>
            <CardDescription>Quản lý đối tượng nhận/gửi tiền</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm theo tên hoặc SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>{searchQuery ? 'Không tìm thấy đối tượng phù hợp' : 'Chưa có đối tượng nào'}</p>
              {!searchQuery && (
                <Button
                  variant="outline"
                  className="mt-4"
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact._id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.phone || '-'}</TableCell>
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
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(contact)}
                          title="Sửa"
                        >
                          <Pencil size={16} />
                        </Button>
                        {contact.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => openDeleteDialog(contact)}
                            title="Vô hiệu hóa"
                          >
                            <Trash2 size={16} />
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm Đối tượng mới</DialogTitle>
            <DialogDescription>Thêm đối tượng nhận/gửi tiền mới</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Tên <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Nhập tên đối tượng"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input
                placeholder="Nhập số điện thoại (tùy chọn)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Đang tạo...' : 'Tạo đối tượng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa Đối tượng</DialogTitle>
            <DialogDescription>Cập nhật thông tin đối tượng: {selectedContact?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Tên <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedContact(null);
                resetForm();
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận vô hiệu hóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn vô hiệu hóa đối tượng &quot;{selectedContact?.name}&quot;? Đối tượng sẽ
              không còn xuất hiện trong danh sách chọn khi tạo giao dịch mới.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedContact(null);
              }}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? 'Đang xử lý...' : 'Vô hiệu hóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
