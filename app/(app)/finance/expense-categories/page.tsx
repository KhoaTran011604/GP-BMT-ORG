'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Pencil, Trash2, FolderTree, Search } from 'lucide-react';

interface ExpenseCategory {
  _id: string;
  categoryCode: string;
  categoryName: string;
  parentId?: string;
  parentName?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ExpenseCategory | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    categoryCode: '',
    categoryName: '',
    parentId: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/expense-categories');
      if (res.ok) {
        const data = await res.json();
        const categoriesData = data.data || [];

        // Map parent names
        const categoriesWithParent = categoriesData.map((cat: ExpenseCategory) => {
          if (cat.parentId) {
            const parent = categoriesData.find((p: ExpenseCategory) => p._id === cat.parentId);
            return { ...cat, parentName: parent?.categoryName };
          }
          return cat;
        });

        setCategories(categoriesWithParent);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      categoryCode: '',
      categoryName: '',
      parentId: '',
      description: '',
      isActive: true
    });
    setShowDialog(true);
  };

  const handleOpenEdit = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setFormData({
      categoryCode: category.categoryCode,
      categoryName: category.categoryName,
      parentId: category.parentId || '',
      description: category.description || '',
      isActive: category.isActive
    });
    setShowDialog(true);
  };

  const handleOpenDelete = (category: ExpenseCategory) => {
    setDeletingCategory(category);
    setShowDeleteDialog(true);
  };

  const handleSave = async () => {
    if (!formData.categoryCode || !formData.categoryName) {
      alert('Vui lòng nhập mã và tên danh mục');
      return;
    }

    setSaving(true);
    try {
      const url = editingCategory
        ? `/api/expense-categories/${editingCategory._id}`
        : '/api/expense-categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const body = {
        ...formData,
        parentId: formData.parentId || undefined
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        alert(editingCategory ? 'Cập nhật thành công!' : 'Tạo danh mục thành công!');
        setShowDialog(false);
        fetchCategories();
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Không thể lưu danh mục');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      const res = await fetch(`/api/expense-categories/${deletingCategory._id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('Xóa danh mục thành công!');
        setShowDeleteDialog(false);
        setDeletingCategory(null);
        fetchCategories();
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Không thể xóa danh mục');
    }
  };

  const handleToggleActive = async (category: ExpenseCategory) => {
    try {
      const res = await fetch(`/api/expense-categories/${category._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !category.isActive })
      });

      if (res.ok) {
        fetchCategories();
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.error}`);
      }
    } catch (error) {
      console.error('Error toggling category:', error);
    }
  };

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = searchQuery === '' ||
      cat.categoryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesActive = filterActive === 'all' ||
      (filterActive === 'active' && cat.isActive) ||
      (filterActive === 'inactive' && !cat.isActive);

    return matchesSearch && matchesActive;
  });

  const parentCategories = categories.filter(cat =>
    !cat.parentId && cat.isActive && cat._id !== editingCategory?._id
  );

  const activeCount = categories.filter(c => c.isActive).length;
  const inactiveCount = categories.filter(c => !c.isActive).length;

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
          <h1 className="text-2xl font-bold">Danh mục Chi</h1>
          <p className="text-gray-600">Quản lý các danh mục chi tiêu</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus size={16} className="mr-2" />
          Thêm danh mục
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderTree className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-gray-600">Tổng danh mục</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FolderTree className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                <p className="text-sm text-gray-600">Đang hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FolderTree className="text-gray-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{inactiveCount}</p>
                <p className="text-sm text-gray-600">Ngừng hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm theo mã hoặc tên danh mục..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterActive} onValueChange={(v: 'all' | 'active' | 'inactive') => setFilterActive(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục chi</CardTitle>
          <CardDescription>
            Hiển thị {filteredCategories.length} / {categories.length} danh mục
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FolderTree size={48} className="mx-auto mb-4 opacity-50" />
              <p>Chưa có danh mục nào</p>
              <Button variant="outline" className="mt-4" onClick={handleOpenCreate}>
                <Plus size={16} className="mr-2" />
                Tạo danh mục đầu tiên
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Mã</TableHead>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Danh mục cha</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-mono font-medium">{category.categoryCode}</TableCell>
                    <TableCell className="font-medium">{category.categoryName}</TableCell>
                    <TableCell>
                      {category.parentName ? (
                        <Badge variant="outline">{category.parentName}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-[200px] truncate">
                      {category.description || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={category.isActive}
                          onCheckedChange={() => handleToggleActive(category)}
                        />
                        <Badge className={category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                          {category.isActive ? 'Hoạt động' : 'Ngừng'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(category)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleOpenDelete(category)}
                        >
                          <Trash2 size={16} />
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

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Cập nhật thông tin danh mục chi' : 'Tạo danh mục chi mới cho hệ thống'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoryCode">Mã danh mục *</Label>
                <Input
                  id="categoryCode"
                  placeholder="VD: EXP_001"
                  value={formData.categoryCode}
                  onChange={(e) => setFormData({ ...formData, categoryCode: e.target.value.toUpperCase() })}
                  disabled={!!editingCategory}
                />
              </div>
              <div>
                <Label htmlFor="parentId">Danh mục cha</Label>
                <Select
                  value={formData.parentId || 'none'}
                  onValueChange={(v) => setFormData({ ...formData, parentId: v === 'none' ? '' : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Không có (danh mục gốc)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có (danh mục gốc)</SelectItem>
                    {parentCategories.filter(cat => cat._id).map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.categoryCode} - {cat.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="categoryName">Tên danh mục *</Label>
              <Input
                id="categoryName"
                placeholder="VD: Chi phí văn phòng"
                value={formData.categoryName}
                onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về danh mục chi này..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {editingCategory && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>Đang hoạt động</Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : (editingCategory ? 'Cập nhật' : 'Tạo mới')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa danh mục <strong>{deletingCategory?.categoryName}</strong>?
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
