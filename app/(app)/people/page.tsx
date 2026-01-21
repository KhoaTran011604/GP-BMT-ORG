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
          <h1 className="text-2xl font-bold">Danh sach Giao dan</h1>
          <p className="text-gray-600">Quan ly thong tin giao dan</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>+ Them Giao dan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPerson ? 'Chinh sua Giao dan' : 'Them Giao dan moi'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Gia dinh *</Label>
                  <Select
                    value={formData.familyId}
                    onValueChange={(value) => setFormData({ ...formData, familyId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chon Gia dinh" />
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
                  <Label>Ten thanh *</Label>
                  <Input
                    value={formData.saintName}
                    onChange={(e) => setFormData({ ...formData, saintName: e.target.value })}
                    placeholder="VD: Phaolo"
                    required
                  />
                </div>
                <div>
                  <Label>Ho va ten *</Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="VD: Nguyen Van A"
                    required
                  />
                </div>
                <div>
                  <Label>Gioi tinh *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: 'male' | 'female') => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ngay sinh *</Label>
                  <Input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Noi sinh</Label>
                  <Input
                    value={formData.birthplace}
                    onChange={(e) => setFormData({ ...formData, birthplace: e.target.value })}
                    placeholder="Noi sinh"
                  />
                </div>
                <div>
                  <Label>Quan he *</Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chu_ho">Chu ho</SelectItem>
                      <SelectItem value="vo_chong">Vo/Chong</SelectItem>
                      <SelectItem value="con">Con</SelectItem>
                      <SelectItem value="cha_me">Cha/Me</SelectItem>
                      <SelectItem value="anh_chi_em">Anh/Chi/Em</SelectItem>
                      <SelectItem value="khac">Khac</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Dien thoai</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="So dien thoai"
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
                  <Label>Nghe nghiep</Label>
                  <Input
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    placeholder="Nghe nghiep"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Ghi chu</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ghi chu"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                  Huy
                </Button>
                <Button type="submit">{editingPerson ? 'Cap nhat' : 'Luu'}</Button>
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
            <p className="text-sm text-gray-600">Tong so giao dan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {people.filter(p => p.status === 'active').length}
            </div>
            <p className="text-sm text-gray-600">Dang hoat dong</p>
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
            <p className="text-sm text-gray-600">Nu</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sach Giao dan ({filteredPeople.length})</CardTitle>
            <Input
              placeholder="Tim kiem..."
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
              <p>Chua co giao dan nao duoc dang ky</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ten thanh</TableHead>
                  <TableHead>Ho va ten</TableHead>
                  <TableHead>Gia dinh</TableHead>
                  <TableHead>Gioi tinh</TableHead>
                  <TableHead>Ngay sinh</TableHead>
                  <TableHead>Quan he</TableHead>
                  <TableHead>Dien thoai</TableHead>
                  <TableHead>Trang thai</TableHead>
                  <TableHead className="text-right">Thao tac</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPeople.map((person) => (
                  <TableRow key={person._id}>
                    <TableCell className="font-medium">{person.saintName}</TableCell>
                    <TableCell>{person.fullName}</TableCell>
                    <TableCell>{person.familyName || '-'}</TableCell>
                    <TableCell>{person.gender === 'male' ? 'Nam' : 'Nu'}</TableCell>
                    <TableCell>{person.dob ? new Date(person.dob).toLocaleDateString('vi-VN') : '-'}</TableCell>
                    <TableCell>
                      {person.relationship === 'chu_ho' ? 'Chu ho' :
                       person.relationship === 'vo_chong' ? 'Vo/Chong' :
                       person.relationship === 'con' ? 'Con' :
                       person.relationship === 'cha_me' ? 'Cha/Me' :
                       person.relationship === 'anh_chi_em' ? 'Anh/Chi/Em' : 'Khac'}
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
                        {person.status === 'active' ? 'Hoat dong' :
                         person.status === 'moved' ? 'Da chuyen' :
                         person.status === 'deceased' ? 'Da mat' : 'Khac'}
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
            <AlertDialogTitle>Xac nhan xoa</AlertDialogTitle>
            <AlertDialogDescription>
              Ban co chac chan muon xoa giao dan <strong>{deletingPerson?.saintName} {deletingPerson?.fullName}</strong>?
              <br />
              Hanh dong nay khong the hoan tac.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xoa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
