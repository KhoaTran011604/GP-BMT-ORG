'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

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

interface SubParish {
  _id: string;
  subParishCode: string;
  subParishName: string;
  patronSaint?: string;
  address?: string;
  parishId: string;
}

export default function ParishDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const parishId = params.id as string;

  const [parish, setParish] = useState<Parish | null>(null);
  const [subParishes, setSubParishes] = useState<SubParish[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingSubParish, setEditingSubParish] = useState<SubParish | null>(null);
  const [formData, setFormData] = useState({
    subParishCode: '',
    subParishName: '',
    patronSaint: '',
    address: '',
  });

  // Delete confirmation dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SubParish | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchParishData();
  }, [parishId]);

  const fetchParishData = async () => {
    try {
      setLoading(true);
      const [parishRes, subParishRes] = await Promise.all([
        fetch(`/api/parishes/${parishId}`),
        fetch(`/api/sub-parishes?parishId=${parishId}`),
      ]);

      if (parishRes.ok) {
        const data = await parishRes.json();
        setParish(data.data);
      }

      if (subParishRes.ok) {
        const data = await subParishRes.json();
        setSubParishes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching parish data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (subParish?: SubParish) => {
    if (subParish) {
      setEditingSubParish(subParish);
      setFormData({
        subParishCode: subParish.subParishCode,
        subParishName: subParish.subParishName,
        patronSaint: subParish.patronSaint || '',
        address: subParish.address || '',
      });
    } else {
      setEditingSubParish(null);
      setFormData({
        subParishCode: '',
        subParishName: '',
        patronSaint: '',
        address: '',
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingSubParish
        ? `/api/sub-parishes/${editingSubParish._id}`
        : '/api/sub-parishes';
      const method = editingSubParish ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        parishId,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowDialog(false);
        fetchParishData();
      } else {
        const error = await response.json();
        alert(error.error || 'Error saving sub-parish');
      }
    } catch (error) {
      console.error('Error saving sub-parish:', error);
      alert('Error saving sub-parish');
    }
  };

  const handleDelete = (subParish: SubParish) => {
    setDeleteTarget(subParish);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/sub-parishes/${deleteTarget._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        setDeleteTarget(null);
        fetchParishData();
      } else {
        alert('Error deleting sub-parish');
      }
    } catch (error) {
      console.error('Error deleting sub-parish:', error);
    } finally {
      setDeleting(false);
    }
  };

  const canEdit = ['super_admin', 'cha_quan_ly', 'cha_xu'].includes(user?.role || '');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!parish) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Không tìm thấy Giáo xứ</p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{parish.parishName}</h1>
          <p className="text-gray-600">Mã giáo xứ: {parish.parishCode}</p>
        </div>
      </div>

      {/* Parish Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin Giáo xứ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Bổn mạng</p>
              <p className="font-semibold text-lg">{parish.patronSaint}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ngày lễ Bổn mạng</p>
              <p className="font-semibold text-lg">{parish.feastDay || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Địa chỉ</p>
              <p className="font-semibold">{parish.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Trạng thái</p>
              <p className="font-semibold">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  parish.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {parish.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </p>
            </div>
            {parish.phone && (
              <div>
                <p className="text-sm text-gray-600">Điện thoại</p>
                <p className="font-semibold">{parish.phone}</p>
              </div>
            )}
            {parish.email && (
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{parish.email}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sub-Parishes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Danh sách Giáo họ</CardTitle>
            <CardDescription>Các giáo họ trực thuộc giáo xứ này</CardDescription>
          </div>
          {canEdit && (
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus size={20} />
              Thêm Giáo họ
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {subParishes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Chưa có Giáo họ nào</p>
              {canEdit && (
                <Button onClick={() => handleOpenDialog()}>Thêm Giáo họ đầu tiên</Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {subParishes.map((subParish) => (
                <div
                  key={subParish._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold">{subParish.subParishName}</h3>
                      <p className="text-sm text-gray-600">
                        Mã: {subParish.subParishCode}
                      </p>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(subParish)}
                        >
                          <Edit2 size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(subParish)}
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    {subParish.patronSaint && (
                      <div>
                        <p className="text-gray-600">Bổn mạng</p>
                        <p className="font-medium">{subParish.patronSaint}</p>
                      </div>
                    )}
                    {subParish.address && (
                      <div>
                        <p className="text-gray-600">Địa chỉ</p>
                        <p className="font-medium">{subParish.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubParish ? 'Cập nhật Giáo họ' : 'Thêm Giáo họ mới'}
            </DialogTitle>
            <DialogDescription>
              {editingSubParish
                ? 'Cập nhật thông tin Giáo họ'
                : 'Nhập thông tin Giáo họ mới'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mã Giáo họ *</label>
              <Input
                placeholder="VD: GH001"
                value={formData.subParishCode}
                onChange={(e) =>
                  setFormData({ ...formData, subParishCode: e.target.value })
                }
                required
                disabled={!!editingSubParish}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tên Giáo họ *</label>
              <Input
                placeholder="VD: Giáo họ Thánh Phaolô"
                value={formData.subParishName}
                onChange={(e) =>
                  setFormData({ ...formData, subParishName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bổn mạng</label>
              <Input
                placeholder="VD: Thánh Phaolô"
                value={formData.patronSaint}
                onChange={(e) =>
                  setFormData({ ...formData, patronSaint: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Địa chỉ</label>
              <Input
                placeholder="Địa chỉ Giáo họ"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
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
                {editingSubParish ? 'Cập nhật' : 'Thêm'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
        description={`Bạn chắc chắn muốn xóa Giáo họ "${deleteTarget?.subParishName}"?`}
        loading={deleting}
      />
    </div>
  );
}
