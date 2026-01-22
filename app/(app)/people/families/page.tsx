'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Pencil, Trash2 } from 'lucide-react';

interface Family {
  _id: string;
  familyCode: string;
  familyName: string;
  parishId: string;
  parishName?: string;
  subParishId?: string;
  address: string;
  phone?: string;
  registrationDate: string;
  memberCount?: number;
  status: string;
}

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [parishes, setParishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [deletingFamily, setDeletingFamily] = useState<Family | null>(null);
  const [formData, setFormData] = useState({
    familyCode: '',
    familyName: '',
    parishId: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [familyRes, parishRes] = await Promise.all([
        fetch('/api/families'),
        fetch('/api/parishes')
      ]);

      if (familyRes.ok) {
        const data = await familyRes.json();
        setFamilies(data.data || []);
      }

      if (parishRes.ok) {
        const data = await parishRes.json();
        setParishes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = editingFamily !== null;
      const url = '/api/families';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing
        ? { _id: editingFamily._id, ...formData }
        : { ...formData, registrationDate: new Date().toISOString(), status: 'active' };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        setEditingFamily(null);
        setFormData({
          familyCode: '',
          familyName: '',
          parishId: '',
          address: '',
          phone: '',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error saving family:', error);
    }
  };

  const handleEdit = (family: Family) => {
    setEditingFamily(family);
    setFormData({
      familyCode: family.familyCode,
      familyName: family.familyName,
      parishId: family.parishId,
      address: family.address,
      phone: family.phone || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingFamily) return;

    try {
      const res = await fetch(`/api/families?id=${deletingFamily._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeletingFamily(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting family:', error);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingFamily(null);
      setFormData({
        familyCode: '',
        familyName: '',
        parishId: '',
        address: '',
        phone: '',
      });
    }
  };

  const filteredFamilies = families.filter(f =>
    f.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.familyCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sổ Gia đình Công giáo</h1>
          <p className="text-gray-600">Quản lý danh sách gia đình trong Giáo phận</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>+ Thêm Gia đình</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFamily ? 'Chỉnh sửa Gia đình' : 'Đăng ký Gia đình mới'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mã Gia đình *</Label>
                  <Input
                    value={formData.familyCode}
                    onChange={(e) => setFormData({ ...formData, familyCode: e.target.value })}
                    placeholder="VD: GD001"
                    required
                  />
                </div>
                <div>
                  <Label>Tên Chủ hộ *</Label>
                  <Input
                    value={formData.familyName}
                    onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                    placeholder="VD: Nguyen Van A"
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Thuộc Giáo xứ *</Label>
                <Select
                  value={formData.parishId}
                  onValueChange={(value) => setFormData({ ...formData, parishId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn Giáo xứ" />
                  </SelectTrigger>
                  <SelectContent>
                    {(parishes || []).map((parish) => (
                      <SelectItem key={parish._id} value={parish._id}>
                        {parish.parishName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Địa chỉ *</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Địa chỉ cụ thể"
                  required
                />
              </div>
              <div>
                <Label>Điện thoại</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Số điện thoại"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                  Hủy
                </Button>
                <Button type="submit">{editingFamily ? 'Cập nhật' : 'Lưu'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{families.length}</div>
            <p className="text-sm text-gray-600">Tổng số gia đình</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {families.filter(f => f.status === 'active').length}
            </div>
            <p className="text-sm text-gray-600">Đang hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {families.reduce((sum, f) => sum + (f.memberCount || 0), 0)}
            </div>
            <p className="text-sm text-gray-600">Tổng thành viên</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(families.map(f => f.parishId)).size}
            </div>
            <p className="text-sm text-gray-600">Giáo xứ có gia đình</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách Gia đình ({filteredFamilies.length})</CardTitle>
            <Input
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredFamilies.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">👨‍👩‍👧‍👦</p>
              <p>Chưa có gia đình nào được đăng ký</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên Chủ hộ</TableHead>
                  <TableHead>Giáo xứ</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Điện thoại</TableHead>
                  <TableHead>Thành viên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFamilies.map((family) => (
                  <TableRow key={family._id}>
                    <TableCell className="font-mono">{family.familyCode}</TableCell>
                    <TableCell className="font-medium">{family.familyName}</TableCell>
                    <TableCell>{family.parishName || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">{family.address}</TableCell>
                    <TableCell>{family.phone || '-'}</TableCell>
                    <TableCell>{family.memberCount || 0}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        family.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : family.status === 'moved'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {family.status === 'active' ? 'Hoạt động' :
                         family.status === 'moved' ? 'Đã chuyển' : 'Khác'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(family)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingFamily(family)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingFamily} onOpenChange={(open) => !open && setDeletingFamily(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa gia đình <strong>{deletingFamily?.familyName}</strong> (Mã: {deletingFamily?.familyCode})?
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
