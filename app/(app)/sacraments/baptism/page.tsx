'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BaptismRecord {
  _id: string;
  baptismName: string;
  fullName: string;
  dob: string;
  baptismDate: string;
  baptismPlace: string;
  minister: string;
  godfather?: string;
  godmother?: string;
  fatherName: string;
  motherName: string;
  registerBook: string;
  registerNo: string;
  parishId: string;
  parishName?: string;
  notes?: string;
}

export default function BaptismPage() {
  const [records, setRecords] = useState<BaptismRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    baptismName: '',
    fullName: '',
    dob: '',
    baptismDate: '',
    baptismPlace: '',
    minister: '',
    godfather: '',
    godmother: '',
    fatherName: '',
    motherName: '',
    registerBook: '',
    registerNo: '',
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/sacraments/baptism');
      if (res.ok) {
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching baptism records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sacraments/baptism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        fetchRecords();
      }
    } catch (error) {
      console.error('Error creating baptism record:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const filteredRecords = records.filter(r =>
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.baptismName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.registerNo.includes(searchTerm)
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
          <h1 className="text-2xl font-bold">So Rua toi</h1>
          <p className="text-gray-600">Quan ly so bo Bi tich Rua toi</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Them ban ghi</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Them ban ghi Rua toi</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ten thanh Rua toi *</Label>
                  <Input
                    value={formData.baptismName}
                    onChange={(e) => setFormData({ ...formData, baptismName: e.target.value })}
                    placeholder="VD: Giuse"
                    required
                  />
                </div>
                <div>
                  <Label>Ho va Ten *</Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ho va ten day du"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <Label>Ngay Rua toi *</Label>
                  <Input
                    type="date"
                    value={formData.baptismDate}
                    onChange={(e) => setFormData({ ...formData, baptismDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Noi Rua toi *</Label>
                  <Input
                    value={formData.baptismPlace}
                    onChange={(e) => setFormData({ ...formData, baptismPlace: e.target.value })}
                    placeholder="VD: Nha tho Chinh toa"
                    required
                  />
                </div>
                <div>
                  <Label>Linh muc cu hanh *</Label>
                  <Input
                    value={formData.minister}
                    onChange={(e) => setFormData({ ...formData, minister: e.target.value })}
                    placeholder="Ten Linh muc"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cha do dau</Label>
                  <Input
                    value={formData.godfather}
                    onChange={(e) => setFormData({ ...formData, godfather: e.target.value })}
                    placeholder="Ten cha do dau"
                  />
                </div>
                <div>
                  <Label>Me do dau</Label>
                  <Input
                    value={formData.godmother}
                    onChange={(e) => setFormData({ ...formData, godmother: e.target.value })}
                    placeholder="Ten me do dau"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ten cha *</Label>
                  <Input
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="Ten cha ruot"
                    required
                  />
                </div>
                <div>
                  <Label>Ten me *</Label>
                  <Input
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    placeholder="Ten me ruot"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>So so *</Label>
                  <Input
                    value={formData.registerBook}
                    onChange={(e) => setFormData({ ...formData, registerBook: e.target.value })}
                    placeholder="VD: 01"
                    required
                  />
                </div>
                <div>
                  <Label>So thu tu *</Label>
                  <Input
                    value={formData.registerNo}
                    onChange={(e) => setFormData({ ...formData, registerNo: e.target.value })}
                    placeholder="VD: 001"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Huy
                </Button>
                <Button type="submit">Luu</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{records.length}</div>
            <p className="text-sm text-white/80">Tong so ban ghi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {records.filter(r => new Date(r.baptismDate).getFullYear() === new Date().getFullYear()).length}
            </div>
            <p className="text-sm text-gray-600">Rua toi nam nay</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(records.map(r => r.parishName)).size}
            </div>
            <p className="text-sm text-gray-600">Giao xu co ban ghi</p>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sach ban ghi ({filteredRecords.length})</CardTitle>
            <Input
              placeholder="Tim kiem theo ten, so..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">💧</p>
              <p>Chua co ban ghi Rua toi nao</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>So so/STT</TableHead>
                  <TableHead>Ten thanh</TableHead>
                  <TableHead>Ho ten</TableHead>
                  <TableHead>Ngay sinh</TableHead>
                  <TableHead>Ngay Rua toi</TableHead>
                  <TableHead>Noi Rua toi</TableHead>
                  <TableHead>Linh muc</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-mono">{r.registerBook}/{r.registerNo}</TableCell>
                    <TableCell className="font-medium">{r.baptismName}</TableCell>
                    <TableCell>{r.fullName}</TableCell>
                    <TableCell>{formatDate(r.dob)}</TableCell>
                    <TableCell>{formatDate(r.baptismDate)}</TableCell>
                    <TableCell>{r.baptismPlace}</TableCell>
                    <TableCell>{r.minister}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Chi tiet</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
