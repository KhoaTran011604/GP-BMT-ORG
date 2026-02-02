'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormSection, FormField, FormLabel, FormGrid } from '@/components/ui/form-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface Person {
  _id: string;
  parishId: string;
  parishName?: string;
  familyId?: string;
  familyName?: string;
  saintName: string;
  fullName: string;
  gender: 'male' | 'female';
  dob: string;
  birthplace?: string;
  relationship: string;
  phone?: string;
  email?: string;
  occupation?: string;
  notes?: string;
  status: string;
}

interface Parish {
  _id: string;
  parishCode: string;
  parishName: string;
}

export default function PeoplePage() {
  const { user } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);
  const [formData, setFormData] = useState({
    parishId: '',
    saintName: '',
    fullName: '',
    gender: 'male' as 'male' | 'female',
    dob: '',
    birthplace: '',
    relationship: 'giao_dan',
    phone: '',
    email: '',
    occupation: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Set default parishId from user
  useEffect(() => {
    if (user?.parishId) {
      setFormData(prev => ({ ...prev, parishId: user.parishId! }));
    }
  }, [user?.parishId]);

  const fetchData = async () => {
    try {
      const [peopleRes, parishesRes] = await Promise.all([
        fetch('/api/people'),
        fetch('/api/parishes')
      ]);

      if (peopleRes.ok) {
        const data = await peopleRes.json();
        setPeople(data.data || []);
      }

      if (parishesRes.ok) {
        const data = await parishesRes.json();
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
      const isEditing = editingPerson !== null;
      const url = '/api/people';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing
        ? { _id: editingPerson._id, ...formData, status: editingPerson.status }
        : { ...formData, status: 'active' };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        setEditingPerson(null);
        setFormData({
          parishId: user?.parishId || '',
          saintName: '',
          fullName: '',
          gender: 'male',
          dob: '',
          birthplace: '',
          relationship: 'giao_dan',
          phone: '',
          email: '',
          occupation: '',
          notes: '',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error saving person:', error);
    }
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      parishId: person.parishId || '',
      saintName: person.saintName,
      fullName: person.fullName,
      gender: person.gender,
      dob: person.dob ? new Date(person.dob).toISOString().split('T')[0] : '',
      birthplace: person.birthplace || '',
      relationship: person.relationship || 'giao_dan',
      phone: person.phone || '',
      email: person.email || '',
      occupation: person.occupation || '',
      notes: person.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingPerson) return;

    try {
      const res = await fetch(`/api/people?id=${deletingPerson._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeletingPerson(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingPerson(null);
      setFormData({
        parishId: user?.parishId || '',
        saintName: '',
        fullName: '',
        gender: 'male',
        dob: '',
        birthplace: '',
        relationship: 'giao_dan',
        phone: '',
        email: '',
        occupation: '',
        notes: '',
      });
    }
  };

  const filteredPeople = people.filter(p =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.saintName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.parishName && p.parishName.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="page-title">Danh sách Giáo dân</h1>
          <p className="page-description">Quản lý thông tin giáo dân</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 text-base">+ Thêm Giáo dân</Button>
          </DialogTrigger>
          <DialogContent size="xl">
            <DialogHeader>
              <DialogTitle>{editingPerson ? 'Chỉnh sửa Giáo dân' : 'Thêm Giáo dân mới'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Thông tin Giáo xứ */}
              <FormSection title="Thông tin Giáo xứ">
                <FormGrid columns={2}>
                  <FormField>
                    <FormLabel required>Giáo xứ</FormLabel>
                    <Select
                      value={formData.parishId}
                      onValueChange={(value) => setFormData({ ...formData, parishId: value })}
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Chọn Giáo xứ" />
                      </SelectTrigger>
                      <SelectContent>
                        {parishes.map((parish) => (
                          <SelectItem key={parish._id} value={parish._id} className="text-base py-3">
                            {parish.parishCode} - {parish.parishName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField>
                    <FormLabel required>Vai trò</FormLabel>
                    <Select
                      value={formData.relationship}
                      onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="giao_dan" className="text-base py-3">Giáo dân</SelectItem>
                        <SelectItem value="giao_ly_vien" className="text-base py-3">Giáo lý viên</SelectItem>
                        <SelectItem value="ca_vien" className="text-base py-3">Ca viên</SelectItem>
                        <SelectItem value="hoi_dong" className="text-base py-3">Hội đồng Giáo xứ</SelectItem>
                        <SelectItem value="tu_si" className="text-base py-3">Tu sĩ</SelectItem>
                        <SelectItem value="khac" className="text-base py-3">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </FormGrid>
              </FormSection>

              {/* Section 2: Thông tin cá nhân */}
              <FormSection title="Thông tin cá nhân">
                <FormGrid columns={2}>
                  <FormField>
                    <FormLabel required>Tên thánh</FormLabel>
                    <Input
                      value={formData.saintName}
                      onChange={(e) => setFormData({ ...formData, saintName: e.target.value })}
                      placeholder="VD: Phaolô"
                      required
                      className="h-12 text-base"
                    />
                  </FormField>
                  <FormField>
                    <FormLabel required>Họ và tên</FormLabel>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="VD: Nguyễn Văn A"
                      required
                      className="h-12 text-base"
                    />
                  </FormField>
                  <FormField>
                    <FormLabel required>Giới tính</FormLabel>
                    <Select
                      value={formData.gender}
                      onValueChange={(value: 'male' | 'female') => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male" className="text-base py-3">Nam</SelectItem>
                        <SelectItem value="female" className="text-base py-3">Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField>
                    <FormLabel required>Ngày sinh</FormLabel>
                    <Input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      required
                      className="h-12 text-base"
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>Nơi sinh</FormLabel>
                    <Input
                      value={formData.birthplace}
                      onChange={(e) => setFormData({ ...formData, birthplace: e.target.value })}
                      placeholder="Nơi sinh"
                      className="h-12 text-base"
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>Nghề nghiệp</FormLabel>
                    <Input
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      placeholder="Nghề nghiệp"
                      className="h-12 text-base"
                    />
                  </FormField>
                </FormGrid>
              </FormSection>

              {/* Section 3: Thông tin liên hệ */}
              <FormSection title="Thông tin liên hệ">
                <FormGrid columns={2}>
                  <FormField>
                    <FormLabel>Điện thoại</FormLabel>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Số điện thoại"
                      className="h-12 text-base"
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email"
                      className="h-12 text-base"
                    />
                  </FormField>
                </FormGrid>
              </FormSection>

              {/* Section 4: Ghi chú */}
              <FormSection title="Ghi chú thêm">
                <FormField>
                  <FormLabel>Ghi chú</FormLabel>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ghi chú thêm về giáo dân"
                    className="h-12 text-base"
                  />
                </FormField>
              </FormSection>

              {/* Actions */}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogClose(false)}
                  className="h-12 px-8 text-base sm:w-auto w-full"
                >
                  Hủy bỏ
                </Button>
                <Button type="submit" className="h-12 px-8 text-base sm:w-auto w-full">
                  {editingPerson ? 'Cập nhật' : 'Lưu thông tin'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="stat-card">
            <div className="stat-value text-blue-600">{people.length}</div>
            <p className="stat-label">Tổng số giáo dân</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="stat-card">
            <div className="stat-value text-green-600">
              {people.filter(p => p.status === 'active').length}
            </div>
            <p className="stat-label">Đang hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="stat-card">
            <div className="stat-value text-orange-600">
              {people.filter(p => p.gender === 'male').length}
            </div>
            <p className="stat-label">Nam</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="stat-card">
            <div className="stat-value text-purple-600">
              {people.filter(p => p.gender === 'female').length}
            </div>
            <p className="stat-label">Nữ</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl sm:text-2xl">Danh sách Giáo dân ({filteredPeople.length})</CardTitle>
            <Input
              placeholder="Tìm kiếm theo tên, giáo xứ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-72 h-12 text-base"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredPeople.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-icon">👤</p>
              <p className="empty-state-text">Chưa có giáo dân nào được đăng ký</p>
            </div>
          ) : (
            <Table className="table-lg">
              <TableHeader>
                <TableRow>
                  <TableHead>Tên thánh</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Giáo xứ</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>Ngày sinh</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Điện thoại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPeople.map((person) => (
                  <TableRow key={person._id}>
                    <TableCell className="font-medium">{person.saintName}</TableCell>
                    <TableCell>{person.fullName}</TableCell>
                    <TableCell>{person.parishName || '-'}</TableCell>
                    <TableCell>{person.gender === 'male' ? 'Nam' : 'Nữ'}</TableCell>
                    <TableCell>{person.dob ? new Date(person.dob).toLocaleDateString('vi-VN') : '-'}</TableCell>
                    <TableCell>
                      {person.relationship === 'giao_dan' ? 'Giáo dân' :
                       person.relationship === 'giao_ly_vien' ? 'Giáo lý viên' :
                       person.relationship === 'ca_vien' ? 'Ca viên' :
                       person.relationship === 'hoi_dong' ? 'Hội đồng GX' :
                       person.relationship === 'tu_si' ? 'Tu sĩ' : 'Khác'}
                    </TableCell>
                    <TableCell>{person.phone || '-'}</TableCell>
                    <TableCell>
                      <span className={`status-badge ${
                        person.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : person.status === 'moved'
                          ? 'bg-yellow-100 text-yellow-800'
                          : person.status === 'deceased'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {person.status === 'active' ? 'Hoạt động' :
                         person.status === 'moved' ? 'Đã chuyển' :
                         person.status === 'deceased' ? 'Đã mất' : 'Khác'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleEdit(person)}
                          className="action-btn"
                          title="Chỉnh sửa"
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setDeletingPerson(person)}
                          className="action-btn text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Xóa"
                        >
                          <Trash2 />
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
      <AlertDialog open={!!deletingPerson} onOpenChange={(open) => !open && setDeletingPerson(null)}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl sm:text-2xl">Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription className="text-base mt-3">
              Bạn có chắc chắn muốn xóa giáo dân <strong>{deletingPerson?.saintName} {deletingPerson?.fullName}</strong>?
              <br />
              <span className="text-red-600 font-medium">Hành động này không thể hoàn tác.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="h-12 px-6 text-base">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="h-12 px-6 text-base bg-red-600 hover:bg-red-700">
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
