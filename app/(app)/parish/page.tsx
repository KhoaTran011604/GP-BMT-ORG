'use client';

import React from "react"

import { useEffect, useState, useMemo } from 'react';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FormSection,
  FormField,
  FormLabel,
  FormGrid,
} from '@/components/ui/form-section';
import { useAuth } from '@/lib/auth-context';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

interface Parish {
  _id: string;
  parishCode: string;
  parishName: string;
  patronSaint: string;
  feastDay: string;
  address: string;
  phone?: string;
  email?: string;
  status: string;
}

export default function ParishPage() {
  const { user } = useAuth();
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingParish, setEditingParish] = useState<Parish | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    parishCode: '',
    parishName: '',
    patronSaint: '',
    feastDay: '',
    address: '',
    phone: '',
    email: '',
  });

  // Filter parishes based on search query
  const filteredParishes = useMemo(() => {
    if (!searchQuery.trim()) return parishes;
    const query = searchQuery.toLowerCase();
    return parishes.filter(
      (parish) =>
        parish.parishCode.toLowerCase().includes(query) ||
        parish.parishName.toLowerCase().includes(query) ||
        parish.patronSaint.toLowerCase().includes(query) ||
        parish.address.toLowerCase().includes(query)
    );
  }, [parishes, searchQuery]);

  // Fetch parishes
  useEffect(() => {
    fetchParishes();
  }, []);

  const fetchParishes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/parishes');
      if (response.ok) {
        const data = await response.json();
        setParishes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching parishes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (parish?: Parish) => {
    if (parish) {
      setEditingParish(parish);
      setFormData({
        parishCode: parish.parishCode,
        parishName: parish.parishName,
        patronSaint: parish.patronSaint,
        feastDay: parish.feastDay,
        address: parish.address,
        phone: parish.phone || '',
        email: parish.email || '',
      });
    } else {
      setEditingParish(null);
      setFormData({
        parishCode: '',
        parishName: '',
        patronSaint: '',
        feastDay: '',
        address: '',
        phone: '',
        email: '',
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingParish ? `/api/parishes/${editingParish._id}` : '/api/parishes';
      const method = editingParish ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowDialog(false);
        fetchParishes();
      } else {
        const error = await response.json();
        alert(error.error || 'Error saving parish');
      }
    } catch (error) {
      console.error('Error saving parish:', error);
      alert('Error saving parish');
    }
  };

  const handleDelete = async (parishId: string) => {
    if (!confirm('Bạn chắc chắn muốn xóa Giáo xứ này?')) return;

    try {
      const response = await fetch(`/api/parishes/${parishId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchParishes();
      } else {
        alert('Error deleting parish');
      }
    } catch (error) {
      console.error('Error deleting parish:', error);
    }
  };

  const canEdit = ['super_admin', 'cha_quan_ly'].includes(user?.role || '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Quản lý Giáo xứ</h1>
          <p className="page-description">Danh sách các giáo xứ trong Giáo phận</p>
        </div>
        {canEdit && (
          <Button onClick={() => handleOpenDialog()} className="h-12 px-6 text-base font-semibold">
            <Plus size={20} className="mr-2" />
            Thêm Giáo xứ
          </Button>
        )}
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl sm:text-2xl">Danh sách Giáo xứ</CardTitle>
            <CardDescription className="text-base mt-1">
              {filteredParishes.length} / {parishes.length} giáo xứ
            </CardDescription>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Tìm kiếm theo tên, mã, bổn mạng..."
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
          ) : filteredParishes.length === 0 ? (
            <div className="empty-state">
              {parishes.length === 0 ? (
                <>
                  <p className="empty-state-icon">⛪</p>
                  <p className="empty-state-text mb-4">Chưa có Giáo xứ nào</p>
                  {canEdit && (
                    <Button onClick={() => handleOpenDialog()} className="h-12 px-6 text-base font-semibold">Thêm Giáo xứ đầu tiên</Button>
                  )}
                </>
              ) : (
                <p className="empty-state-text">Không tìm thấy giáo xứ phù hợp</p>
              )}
            </div>
          ) : (
            <Table className="table-lg">
              <TableHeader>
                <TableRow>
                  <TableHead>Mã GX</TableHead>
                  <TableHead>Tên Giáo xứ</TableHead>
                  <TableHead>Bổn mạng</TableHead>
                  <TableHead>Ngày lễ</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParishes.map((parish) => (
                  <TableRow key={parish._id}>
                    <TableCell>
                      <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {parish.parishCode}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{parish.parishName}</TableCell>
                    <TableCell>{parish.patronSaint}</TableCell>
                    <TableCell>{parish.feastDay || '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={parish.address}>
                      {parish.address}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {parish.phone && <div>{parish.phone}</div>}
                        {parish.email && <div className="text-gray-500">{parish.email}</div>}
                        {!parish.phone && !parish.email && '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {canEdit && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => handleOpenDialog(parish)}
                            title="Chỉnh sửa"
                            className="action-btn"
                          >
                            <Edit2 />
                          </Button>
                          <Button
                            variant="ghost"
                            className="action-btn text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(parish._id)}
                            title="Xóa"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>
              {editingParish ? 'Cập nhật Giáo xứ' : 'Thêm Giáo xứ mới'}
            </DialogTitle>
            <DialogDescription>
              {editingParish
                ? 'Cập nhật thông tin Giáo xứ'
                : 'Nhập thông tin Giáo xứ mới'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Thông tin cơ bản */}
            <FormSection title="Thông tin cơ bản">
              <FormGrid columns={2}>
                <FormField>
                  <FormLabel required>Mã Giáo xứ</FormLabel>
                  <Input
                    placeholder="VD: GX001"
                    value={formData.parishCode}
                    onChange={(e) =>
                      setFormData({ ...formData, parishCode: e.target.value })
                    }
                    required
                    disabled={!!editingParish}
                    className="h-12 text-base"
                  />
                </FormField>

                <FormField>
                  <FormLabel required>Tên Giáo xứ</FormLabel>
                  <Input
                    placeholder="VD: Giáo xứ Thánh Phaolô"
                    value={formData.parishName}
                    onChange={(e) =>
                      setFormData({ ...formData, parishName: e.target.value })
                    }
                    required
                    className="h-12 text-base"
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Section 2: Bổn mạng */}
            <FormSection title="Bổn mạng Giáo xứ">
              <FormGrid columns={2}>
                <FormField>
                  <FormLabel required>Thánh Bổn mạng</FormLabel>
                  <Input
                    placeholder="VD: Thánh Phaolô"
                    value={formData.patronSaint}
                    onChange={(e) =>
                      setFormData({ ...formData, patronSaint: e.target.value })
                    }
                    required
                    className="h-12 text-base"
                  />
                </FormField>

                <FormField>
                  <FormLabel>Ngày lễ Bổn mạng</FormLabel>
                  <Input
                    placeholder="VD: 29/6"
                    value={formData.feastDay}
                    onChange={(e) =>
                      setFormData({ ...formData, feastDay: e.target.value })
                    }
                    className="h-12 text-base"
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Section 3: Thông tin liên hệ */}
            <FormSection title="Thông tin liên hệ">
              <FormField>
                <FormLabel required>Địa chỉ</FormLabel>
                <Input
                  placeholder="Địa chỉ Giáo xứ"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                  className="h-12 text-base"
                />
              </FormField>

              <FormGrid columns={2}>
                <FormField>
                  <FormLabel>Điện thoại</FormLabel>
                  <Input
                    placeholder="0123456789"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="h-12 text-base"
                  />
                </FormField>

                <FormField>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="h-12 text-base"
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Actions */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="h-12 px-8 text-base sm:w-auto w-full"
              >
                Hủy bỏ
              </Button>
              <Button type="submit" className="h-12 px-8 text-base sm:w-auto w-full">
                {editingParish ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
