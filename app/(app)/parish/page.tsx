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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
          <h1 className="text-3xl font-bold">Quản lý Giáo xứ</h1>
          <p className="text-gray-600">Danh sách các giáo xứ trong Giáo phận</p>
        </div>
        {canEdit && (
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus size={20} />
            Thêm Giáo xứ
          </Button>
        )}
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Danh sách Giáo xứ</CardTitle>
            <CardDescription>
              {filteredParishes.length} / {parishes.length} giáo xứ
            </CardDescription>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Tìm kiếm theo tên, mã, bổn mạng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>
          ) : filteredParishes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {parishes.length === 0 ? (
                <>
                  <p className="mb-4">Chưa có Giáo xứ nào</p>
                  {canEdit && (
                    <Button onClick={() => handleOpenDialog()}>Thêm Giáo xứ đầu tiên</Button>
                  )}
                </>
              ) : (
                <p>Không tìm thấy giáo xứ phù hợp</p>
              )}
            </div>
          ) : (
            <Table>
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
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(parish)}
                            title="Sửa"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(parish._id)}
                            title="Xóa"
                          >
                            <Trash2 size={16} />
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
        <DialogContent>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mã Giáo xứ *</label>
              <Input
                placeholder="VD: GX001"
                value={formData.parishCode}
                onChange={(e) =>
                  setFormData({ ...formData, parishCode: e.target.value })
                }
                required
                disabled={!!editingParish}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tên Giáo xứ *</label>
              <Input
                placeholder="VD: Giáo xứ Thánh Phaolô"
                value={formData.parishName}
                onChange={(e) =>
                  setFormData({ ...formData, parishName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bổn mạng *</label>
              <Input
                placeholder="VD: Thánh Phaolô"
                value={formData.patronSaint}
                onChange={(e) =>
                  setFormData({ ...formData, patronSaint: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ngày lễ Bổn mạng</label>
              <Input
                placeholder="VD: 29/6"
                value={formData.feastDay}
                onChange={(e) =>
                  setFormData({ ...formData, feastDay: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Địa chỉ *</label>
              <Input
                placeholder="Địa chỉ Giáo xứ"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Điện thoại</label>
              <Input
                placeholder="0123456789"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button type="submit" className="flex-1">
                {editingParish ? 'Cập nhật' : 'Thêm'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
