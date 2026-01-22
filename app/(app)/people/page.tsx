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

interface Person {
  _id: string;
  familyId: string;
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

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);
  const [formData, setFormData] = useState({
    familyId: '',
    saintName: '',
    fullName: '',
    gender: 'male' as 'male' | 'female',
    dob: '',
    birthplace: '',
    relationship: 'chu_ho',
    phone: '',
    email: '',
    occupation: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [peopleRes, familiesRes] = await Promise.all([
        fetch('/api/people'),
        fetch('/api/families')
      ]);

      if (peopleRes.ok) {
        const data = await peopleRes.json();
        setPeople(data.data || []);
      }

      if (familiesRes.ok) {
        const data = await familiesRes.json();
        setFamilies(data.data || []);
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
          familyId: '',
          saintName: '',
          fullName: '',
          gender: 'male',
          dob: '',
          birthplace: '',
          relationship: 'chu_ho',
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
      familyId: person.familyId,
      saintName: person.saintName,
      fullName: person.fullName,
      gender: person.gender,
      dob: person.dob ? new Date(person.dob).toISOString().split('T')[0] : '',
      birthplace: person.birthplace || '',
      relationship: person.relationship,
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
        familyId: '',
        saintName: '',
        fullName: '',
        gender: 'male',
        dob: '',
        birthplace: '',
        relationship: 'chu_ho',
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
    (p.familyName && p.familyName.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="text-2xl font-bold">Danh sách Giáo dân</h1>
          <p className="text-gray-600">Quản lý thông tin giáo dân</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>+ Thêm Giáo dân</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPerson ? 'Chỉnh sửa Giáo dân' : 'Thêm Giáo dân mới'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Gia đình *</Label>
                  <Select
                    value={formData.familyId}
                    onValueChange={(value) => setFormData({ ...formData, familyId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Gia đình" />
                    </SelectTrigger>
                    <SelectContent>
                      {families.map((family) => (
                        <SelectItem key={family._id} value={family._id}>
                          {family.familyCode} - {family.familyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tên thánh *</Label>
                  <Input
                    value={formData.saintName}
                    onChange={(e) => setFormData({ ...formData, saintName: e.target.value })}
                    placeholder="VD: Phaolo"
                    required
                  />
                </div>
                <div>
                  <Label>Họ và tên *</Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="VD: Nguyen Van A"
                    required
                  />
                </div>
                <div>
                  <Label>Giới tính *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: 'male' | 'female') => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ngày sinh *</Label>
                  <Input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Nơi sinh</Label>
                  <Input
                    value={formData.birthplace}
                    onChange={(e) => setFormData({ ...formData, birthplace: e.target.value })}
                    placeholder="Nơi sinh"
                  />
                </div>
                <div>
                  <Label>Quan hệ *</Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chu_ho">Chủ hộ</SelectItem>
                      <SelectItem value="vo_chong">Vợ/Chồng</SelectItem>
                      <SelectItem value="con">Con</SelectItem>
                      <SelectItem value="cha_me">Cha/Mẹ</SelectItem>
                      <SelectItem value="anh_chi_em">Anh/Chị/Em</SelectItem>
                      <SelectItem value="khac">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Điện thoại</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Số điện thoại"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email"
                  />
                </div>
                <div>
                  <Label>Nghề nghiệp</Label>
                  <Input
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    placeholder="Nghề nghiệp"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Ghi chú</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ghi chú"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                  Hủy
                </Button>
                <Button type="submit">{editingPerson ? 'Cập nhật' : 'Lưu'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{people.length}</div>
            <p className="text-sm text-gray-600">Tổng số giáo dân</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {people.filter(p => p.status === 'active').length}
            </div>
            <p className="text-sm text-gray-600">Đang hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {people.filter(p => p.gender === 'male').length}
            </div>
            <p className="text-sm text-gray-600">Nam</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {people.filter(p => p.gender === 'female').length}
            </div>
            <p className="text-sm text-gray-600">Nữ</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách Giáo dân ({filteredPeople.length})</CardTitle>
            <Input
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredPeople.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">👤</p>
              <p>Chưa có giáo dân nào được đăng ký</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên thánh</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Gia đình</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>Ngày sinh</TableHead>
                  <TableHead>Quan hệ</TableHead>
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
                    <TableCell>{person.familyName || '-'}</TableCell>
                    <TableCell>{person.gender === 'male' ? 'Nam' : 'Nữ'}</TableCell>
                    <TableCell>{person.dob ? new Date(person.dob).toLocaleDateString('vi-VN') : '-'}</TableCell>
                    <TableCell>
                      {person.relationship === 'chu_ho' ? 'Chủ hộ' :
                       person.relationship === 'vo_chong' ? 'Vợ/Chồng' :
                       person.relationship === 'con' ? 'Con' :
                       person.relationship === 'cha_me' ? 'Cha/Mẹ' :
                       person.relationship === 'anh_chi_em' ? 'Anh/Chị/Em' : 'Khác'}
                    </TableCell>
                    <TableCell>{person.phone || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
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
                          size="sm"
                          onClick={() => handleEdit(person)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingPerson(person)}
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
      <AlertDialog open={!!deletingPerson} onOpenChange={(open) => !open && setDeletingPerson(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa giáo dân <strong>{deletingPerson?.saintName} {deletingPerson?.fullName}</strong>?
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
