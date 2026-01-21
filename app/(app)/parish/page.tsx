'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Plus, Edit2, Trash2 } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    parishCode: '',
    parishName: '',
    patronSaint: '',
    feastDay: '',
    address: '',
    phone: '',
    email: '',
  });

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

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </CardContent>
        </Card>
      )}

      {/* Parishes List */}
      {!loading && parishes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Chưa có Giáo xứ nào</p>
            {canEdit && (
              <Button onClick={() => handleOpenDialog()}>Thêm Giáo xứ đầu tiên</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {parishes.map((parish) => (
            <Card key={parish._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{parish.parishName}</CardTitle>
                    <CardDescription>{parish.patronSaint}</CardDescription>
                  </div>
                  <div className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded">
                    {parish.parishCode}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Địa chỉ</p>
                    <p className="font-medium">{parish.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày lễ Bổn mạng</p>
                    <p className="font-medium">{parish.feastDay || 'N/A'}</p>
                  </div>
                  {parish.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Điện thoại</p>
                      <p className="font-medium">{parish.phone}</p>
                    </div>
                  )}
                  {parish.email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{parish.email}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Link href={`/parish/${parish._id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Xem chi tiết
                    </Button>
                  </Link>
                  {canEdit && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenDialog(parish)}
                      >
                        <Edit2 size={18} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(parish._id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
