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
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Pencil, Trash2, Shield, UserCog, Lock, CheckCircle, XCircle, User, Key } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Parish } from '@/lib/schemas';
import { FormSection, FormField, FormLabel, FormGrid, FormActions, FormHint, FormInfoBox } from '@/components/ui/form-section';

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
        role: formData.role,
        parishId: formData.parishId || null,
        status: formData.status,
      };

      // Chỉ được sửa tên của chính mình
      if (selectedUser._id === currentUser?.id) {
        updateData.fullName = formData.fullName;
      }

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
      {/* Page Header - Elderly friendly */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Shield className="text-blue-600" size={32} />
            Phân quyền (RBAC)
          </h1>
          <p className="text-base text-gray-600 mt-1">Quản lý người dùng và phân quyền truy cập</p>
        </div>
        {isSuperAdmin && (
          <Button
            onClick={() => { resetForm(); setShowCreateDialog(true); }}
            className="h-12 px-6 text-base font-semibold"
          >
            <Plus size={20} className="mr-2" />
            Thêm người dùng
          </Button>
        )}
      </div>

      {/* Permission Notice - Larger text */}
      {!isSuperAdmin && (
        <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-xl">
          <p className="text-amber-800 text-base">
            <strong>Lưu ý:</strong> Chỉ Super Admin mới có quyền tạo, sửa, xóa người dùng và phân quyền.
          </p>
        </div>
      )}

      {/* Role Summary - Larger cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(roleConfig).map(([key, config]) => (
          <Card
            key={key}
            className={`hover:shadow-lg cursor-pointer transition-all border-2 ${roleFilter === key ? 'ring-2 ring-blue-500 border-blue-300' : 'hover:border-blue-200'}`}
            onClick={() => setRoleFilter(roleFilter === key ? 'all' : key)}
          >
            <CardContent className="p-5 text-center">
              <Badge className={`${config.color} text-sm px-3 py-1`}>{config.label}</Badge>
              <p className="text-3xl font-bold mt-3 text-gray-900">
                {users.filter(u => u.role === key).length}
              </p>
              <p className="text-sm text-gray-500 mt-2">{config.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl">Danh sách người dùng ({filteredUsers.length})</CardTitle>
            <div className="flex gap-3">
              <Input
                placeholder="Tìm kiếm theo tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-72 h-12 text-base"
              />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-44 h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="py-3 text-base">Tất cả vai trò</SelectItem>
                  {Object.entries(roleConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="py-3 text-base">{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <UserCog className="mx-auto mb-4 text-gray-300" size={64} />
              <p className="text-lg">Chưa có người dùng nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-base font-semibold py-4">Người dùng</TableHead>
                  <TableHead className="text-base font-semibold py-4">Vai trò</TableHead>
                  <TableHead className="text-base font-semibold py-4">Đơn vị</TableHead>
                  <TableHead className="text-base font-semibold py-4">Ngày tạo</TableHead>
                  <TableHead className="text-base font-semibold py-4">Trạng thái</TableHead>
                  {isSuperAdmin && <TableHead className="text-base font-semibold py-4 text-right">Thao tác</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u._id} className={`${u.status === 'inactive' ? 'opacity-60' : ''} hover:bg-gray-50`}>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className={`${
                            u.role === 'super_admin'
                              ? 'bg-gradient-to-br from-red-500 to-orange-600'
                              : 'bg-gradient-to-br from-blue-500 to-purple-600'
                          } text-white text-base font-semibold`}>
                            {getInitials(u.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-base font-semibold text-gray-900">{u.fullName}</p>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={`${roleConfig[u.role as keyof typeof roleConfig]?.color} text-sm px-3 py-1`}>
                        {roleConfig[u.role as keyof typeof roleConfig]?.label || u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-base">{u.parishName || 'TGM'}</TableCell>
                    <TableCell className="py-4 text-base text-gray-600">{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="py-4">
                      <Badge
                        className={`cursor-pointer text-sm px-3 py-1 ${
                          u.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        onClick={() => isSuperAdmin && u.role !== 'super_admin' && handleToggleStatus(u)}
                      >
                        {u.status === 'active' ? (
                          <><CheckCircle size={14} className="mr-1" /> Hoạt động</>
                        ) : (
                          <><XCircle size={14} className="mr-1" /> Vô hiệu</>
                        )}
                      </Badge>
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell className="py-4">
                        <div className="flex justify-end gap-1">
                          {u.role !== 'super_admin' && (
                            <>
                              <Button
                                variant="ghost"
                                className="action-btn"
                                onClick={() => openEditDialog(u)}
                                title="Chỉnh sửa"
                              >
                                <Pencil size={18} />
                              </Button>
                              <Button
                                variant="ghost"
                                className="action-btn"
                                onClick={() => { setSelectedUser(u); setNewPassword(''); setShowPasswordDialog(true); }}
                                title="Đổi mật khẩu"
                              >
                                <Lock size={18} />
                              </Button>
                              <Button
                                variant="ghost"
                                className="action-btn text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => { setSelectedUser(u); setShowDeleteDialog(true); }}
                                title="Xóa"
                              >
                                <Trash2 size={18} />
                              </Button>
                            </>
                          )}
                          {u.role === 'super_admin' && (
                            <span className="text-sm text-gray-400 px-3 py-2 bg-gray-100 rounded">Bảo vệ</span>
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Plus className="text-blue-600" size={24} />
              Thêm người dùng mới
            </DialogTitle>
            <DialogDescription className="text-base">
              Tạo tài khoản mới cho người dùng trong hệ thống
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-6 mt-4">
            {/* Section 1: Thông tin cá nhân */}
            <FormSection
              title="Thông tin cá nhân"
              description="Nhập thông tin cơ bản của người dùng"
              icon={<User size={20} />}
            >
              <FormGrid columns={1}>
                <FormField>
                  <FormLabel required>Họ và Tên</FormLabel>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nhập họ và tên đầy đủ"
                    required
                    className="h-12 text-base"
                  />
                </FormField>
                <FormField>
                  <FormLabel required>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    required
                    className="h-12 text-base"
                  />
                  <FormHint>Email sẽ được dùng để đăng nhập</FormHint>
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Section 2: Bảo mật */}
            <FormSection
              title="Bảo mật"
              description="Thiết lập mật khẩu đăng nhập"
              icon={<Key size={20} />}
            >
              <FormField>
                <FormLabel required>Mật khẩu</FormLabel>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  required
                  className="h-12 text-base"
                />
                <FormHint>Mật khẩu phải có ít nhất 6 ký tự</FormHint>
              </FormField>
            </FormSection>

            {/* Section 3: Phân quyền */}
            <FormSection
              title="Phân quyền"
              description="Chọn vai trò và đơn vị công tác"
              icon={<Shield size={20} />}
            >
              <FormGrid columns={1}>
                <FormField>
                  <FormLabel required>Vai trò</FormLabel>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableRoles.map((role) => (
                        <SelectItem key={role.key} value={role.key} className="py-3">
                          <span className="flex items-center gap-2">
                            <Badge className={role.color}>{role.label}</Badge>
                            <span className="text-gray-600">- {role.desc}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormHint>Không thể tạo tài khoản Super Admin</FormHint>
                </FormField>
                <FormField>
                  <FormLabel>Giáo xứ</FormLabel>
                  <Select
                    value={formData.parishId || '_none'}
                    onValueChange={(value) => setFormData({ ...formData, parishId: value === '_none' ? '' : value })}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Chọn giáo xứ (nếu có)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none" className="py-3">TGM (không thuộc giáo xứ)</SelectItem>
                      {parishes.map((p) => (
                        <SelectItem key={p._id?.toString()} value={p._id?.toString() || '_none'} className="py-3">
                          {p.parishName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormHint>Bỏ trống nếu người dùng thuộc Tòa Giám mục</FormHint>
                </FormField>
              </FormGrid>
            </FormSection>

            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="h-12 px-6 text-base"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="h-12 px-8 text-base font-semibold"
              >
                {submitting ? 'Đang tạo...' : 'Tạo người dùng'}
              </Button>
            </FormActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Pencil className="text-blue-600" size={24} />
              Chỉnh sửa người dùng
            </DialogTitle>
            <DialogDescription className="text-base">
              Cập nhật thông tin và quyền hạn của người dùng
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-6 mt-4">
            {/* Section 1: Thông tin cá nhân */}
            <FormSection
              title="Thông tin cá nhân"
              description="Thông tin cơ bản của người dùng"
              icon={<User size={20} />}
            >
              <FormGrid columns={1}>
                <FormField>
                  <FormLabel>Email</FormLabel>
                  <Input
                    value={formData.email}
                    disabled
                    className="h-12 text-base bg-gray-100 text-gray-600"
                  />
                  <FormHint>Email không thể thay đổi</FormHint>
                </FormField>
                <FormField>
                  <FormLabel required={selectedUser?._id === currentUser?.id}>Họ và Tên</FormLabel>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nhập họ và tên"
                    required={selectedUser?._id === currentUser?.id}
                    disabled={selectedUser?._id !== currentUser?.id}
                    className={`h-12 text-base ${selectedUser?._id !== currentUser?.id ? 'bg-gray-100 text-gray-600' : ''}`}
                  />
                  {selectedUser?._id !== currentUser?.id && (
                    <FormInfoBox variant="warning">
                      Không được phép sửa tên của người dùng khác
                    </FormInfoBox>
                  )}
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Section 2: Phân quyền */}
            <FormSection
              title="Phân quyền"
              description="Thiết lập vai trò và đơn vị công tác"
              icon={<Shield size={20} />}
            >
              <FormGrid columns={1}>
                <FormField>
                  <FormLabel required>Vai trò</FormLabel>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableRoles.map((role) => (
                        <SelectItem key={role.key} value={role.key} className="py-3">
                          <span className="flex items-center gap-2">
                            <Badge className={role.color}>{role.label}</Badge>
                            <span className="text-gray-600">- {role.desc}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField>
                  <FormLabel>Giáo xứ</FormLabel>
                  <Select
                    value={formData.parishId || '_none'}
                    onValueChange={(value) => setFormData({ ...formData, parishId: value === '_none' ? '' : value })}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Chọn giáo xứ (nếu có)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none" className="py-3">TGM (không thuộc giáo xứ)</SelectItem>
                      {parishes.map((p) => (
                        <SelectItem key={p._id?.toString()} value={p._id?.toString() || '_none'} className="py-3">
                          {p.parishName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Section 3: Trạng thái */}
            <FormSection
              title="Trạng thái tài khoản"
              description="Quản lý trạng thái hoạt động"
              icon={<CheckCircle size={20} />}
            >
              <FormField>
                <FormLabel>Trạng thái</FormLabel>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active" className="py-3">
                      <span className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        Hoạt động
                      </span>
                    </SelectItem>
                    <SelectItem value="inactive" className="py-3">
                      <span className="flex items-center gap-2">
                        <XCircle size={16} className="text-gray-500" />
                        Vô hiệu
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormHint>Tài khoản vô hiệu sẽ không thể đăng nhập</FormHint>
              </FormField>
            </FormSection>

            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="h-12 px-6 text-base"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="h-12 px-8 text-base font-semibold"
              >
                {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </FormActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Lock className="text-blue-600" size={24} />
              Đổi mật khẩu
            </DialogTitle>
            <DialogDescription className="text-base">
              Đặt mật khẩu mới cho <strong>{selectedUser?.fullName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <FormSection
              title="Mật khẩu mới"
              description="Nhập mật khẩu mới cho người dùng"
              icon={<Lock size={20} />}
            >
              <FormField>
                <FormLabel required>Mật khẩu mới</FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  className="h-12 text-base"
                />
                <FormHint>Mật khẩu phải có ít nhất 6 ký tự</FormHint>
              </FormField>
            </FormSection>

            <FormInfoBox variant="warning">
              Sau khi đổi mật khẩu, người dùng sẽ cần đăng nhập lại với mật khẩu mới.
            </FormInfoBox>

            <FormActions>
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
                className="h-12 px-6 text-base"
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={submitting || !newPassword}
                className="h-12 px-8 text-base font-semibold"
              >
                {submitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
              </Button>
            </FormActions>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setSelectedUser(null);
        }}
        onConfirm={handleDelete}
        description={`Bạn có chắc chắn muốn xóa người dùng "${selectedUser?.fullName}"? Hành động này không thể hoàn tác.`}
        loading={submitting}
      />
    </div>
  );
}
