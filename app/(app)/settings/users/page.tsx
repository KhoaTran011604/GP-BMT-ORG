'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Pencil, Trash2, Shield, UserCog, Lock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Parish } from '@/lib/schemas';

interface User {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  parishId?: string;
  parishName?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
}

const roleConfig = {
  super_admin: { label: 'Super Admin', color: 'bg-red-100 text-red-800', desc: 'Toàn quyền hệ thống', level: 0 },
  cha_quan_ly: { label: 'Cha Quản lý', color: 'bg-purple-100 text-purple-800', desc: 'Phê duyệt, đối soát', level: 1 },
  cha_xu: { label: 'Cha xứ', color: 'bg-blue-100 text-blue-800', desc: 'Quản lý Giáo xứ', level: 2 },
  ke_toan: { label: 'Kế toán VP', color: 'bg-green-100 text-green-800', desc: 'Nhập liệu, báo cáo', level: 3 },
  thu_ky: { label: 'Thư ký GX', color: 'bg-orange-100 text-orange-800', desc: 'Nhập liệu cơ bản', level: 4 },
};

// Roles that can be assigned (excluding super_admin)
const assignableRoles = Object.entries(roleConfig)
  .filter(([key]) => key !== 'super_admin')
  .map(([key, config]) => ({ key, ...config }));

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'thu_ky',
    parishId: '',
    password: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [newPassword, setNewPassword] = useState('');

  const isSuperAdmin = currentUser?.role === 'super_admin';

  useEffect(() => {
    fetchUsers();
    fetchParishes();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const result = await res.json();
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParishes = async () => {
    try {
      const res = await fetch('/api/parishes');
      if (res.ok) {
        const result = await res.json();
        setParishes(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching parishes:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      fullName: '',
      role: 'thu_ky',
      parishId: '',
      password: '',
      status: 'active',
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('Chỉ Super Admin mới có quyền tạo người dùng');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        setShowCreateDialog(false);
        resetForm();
        fetchUsers();
        alert('Tạo người dùng thành công');
      } else {
        alert(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Có lỗi xảy ra khi tạo người dùng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin || !selectedUser) {
      alert('Chỉ Super Admin mới có quyền cập nhật người dùng');
      return;
    }

    setSubmitting(true);
    try {
      const updateData: any = {
        fullName: formData.fullName,
        role: formData.role,
        parishId: formData.parishId || null,
        status: formData.status,
      };

      const res = await fetch(`/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await res.json();
      if (res.ok) {
        setShowEditDialog(false);
        setSelectedUser(null);
        resetForm();
        fetchUsers();
        alert('Cập nhật người dùng thành công');
      } else {
        alert(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Có lỗi xảy ra khi cập nhật');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isSuperAdmin || !selectedUser) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${selectedUser._id}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (res.ok) {
        setShowDeleteDialog(false);
        setSelectedUser(null);
        fetchUsers();
        alert('Xóa người dùng thành công');
      } else {
        alert(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Có lỗi xảy ra khi xóa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!isSuperAdmin || !selectedUser || !newPassword) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      const result = await res.json();
      if (res.ok) {
        setShowPasswordDialog(false);
        setSelectedUser(null);
        setNewPassword('');
        alert('Đổi mật khẩu thành công');
      } else {
        alert(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (!isSuperAdmin) {
      alert('Chỉ Super Admin mới có quyền thay đổi trạng thái');
      return;
    }

    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchUsers();
      } else {
        const result = await res.json();
        alert(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      parishId: user.parishId || '',
      password: '',
      status: user.status,
    });
    setShowEditDialog(true);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch = !searchTerm ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-blue-600" />
            Phân quyền (RBAC)
          </h1>
          <p className="text-gray-600">Quản lý người dùng và phân quyền truy cập</p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
            <Plus size={16} className="mr-2" />
            Thêm người dùng
          </Button>
        )}
      </div>

      {/* Permission Notice */}
      {!isSuperAdmin && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <p className="text-amber-800 text-sm">
            <strong>Lưu ý:</strong> Chỉ Super Admin mới có quyền tạo, sửa, xóa người dùng và phân quyền.
          </p>
        </div>
      )}

      {/* Role Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(roleConfig).map(([key, config]) => (
          <Card
            key={key}
            className={`hover:shadow-md cursor-pointer transition-all ${roleFilter === key ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setRoleFilter(roleFilter === key ? 'all' : key)}
          >
            <CardContent className="p-4 text-center">
              <Badge className={config.color}>{config.label}</Badge>
              <p className="text-2xl font-bold mt-2">
                {users.filter(u => u.role === key).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">{config.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách người dùng ({filteredUsers.length})</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(roleConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserCog className="mx-auto mb-4 text-gray-300" size={48} />
              <p>Chưa có người dùng nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  {isSuperAdmin && <TableHead className="text-right">Thao tác</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u._id} className={u.status === 'inactive' ? 'opacity-60' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className={`${
                            u.role === 'super_admin'
                              ? 'bg-gradient-to-br from-red-500 to-orange-600'
                              : 'bg-gradient-to-br from-blue-500 to-purple-600'
                          } text-white`}>
                            {getInitials(u.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.fullName}</p>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleConfig[u.role as keyof typeof roleConfig]?.color}>
                        {roleConfig[u.role as keyof typeof roleConfig]?.label || u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{u.parishName || 'TGM'}</TableCell>
                    <TableCell className="text-sm">{formatDate(u.createdAt)}</TableCell>
                    <TableCell>
                      <Badge
                        className={`cursor-pointer ${
                          u.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        onClick={() => isSuperAdmin && u.role !== 'super_admin' && handleToggleStatus(u)}
                      >
                        {u.status === 'active' ? (
                          <><CheckCircle size={12} className="mr-1" /> Hoạt động</>
                        ) : (
                          <><XCircle size={12} className="mr-1" /> Vô hiệu</>
                        )}
                      </Badge>
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {u.role !== 'super_admin' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(u)}
                                title="Sửa"
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setSelectedUser(u); setNewPassword(''); setShowPasswordDialog(true); }}
                                title="Đổi mật khẩu"
                              >
                                <Lock size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => { setSelectedUser(u); setShowDeleteDialog(true); }}
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </>
                          )}
                          {u.role === 'super_admin' && (
                            <span className="text-xs text-gray-400 px-2">Protected</span>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản mới cho người dùng trong hệ thống
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Họ và Tên *</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Nhập họ và tên"
                required
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <Label>Mật khẩu *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
            <div>
              <Label>Vai trò *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assignableRoles.map((role) => (
                    <SelectItem key={role.key} value={role.key}>
                      <span className="flex items-center gap-2">
                        <Badge className={role.color}>{role.label}</Badge>
                        <span className="text-gray-500">- {role.desc}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Không thể tạo tài khoản Super Admin
              </p>
            </div>
            <div>
              <Label>Giáo xứ</Label>
              <Select
                value={formData.parishId || '_none'}
                onValueChange={(value) => setFormData({ ...formData, parishId: value === '_none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giáo xứ (nếu có)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">TGM (không thuộc giáo xứ)</SelectItem>
                  {parishes.map((p) => (
                    <SelectItem key={p._id?.toString()} value={p._id?.toString() || '_none'}>
                      {p.parishName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Đang tạo...' : 'Tạo người dùng'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin và quyền hạn của người dùng
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                value={formData.email}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label>Họ và Tên *</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Nhập họ và tên"
                required
              />
            </div>
            <div>
              <Label>Vai trò *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assignableRoles.map((role) => (
                    <SelectItem key={role.key} value={role.key}>
                      <span className="flex items-center gap-2">
                        <Badge className={role.color}>{role.label}</Badge>
                        <span className="text-gray-500">- {role.desc}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Giáo xứ</Label>
              <Select
                value={formData.parishId || '_none'}
                onValueChange={(value) => setFormData({ ...formData, parishId: value === '_none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giáo xứ (nếu có)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">TGM (không thuộc giáo xứ)</SelectItem>
                  {parishes.map((p) => (
                    <SelectItem key={p._id?.toString()} value={p._id?.toString() || '_none'}>
                      {p.parishName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Vô hiệu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi mật khẩu</DialogTitle>
            <DialogDescription>
              Đặt mật khẩu mới cho {selectedUser?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Mật khẩu mới *</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleChangePassword} disabled={submitting || !newPassword}>
              {submitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.fullName}</strong>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
