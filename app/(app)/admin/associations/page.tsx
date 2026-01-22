'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Association {
  _id: string;
  name: string;
  parishId: string;
  parishName?: string;
  patronSaint?: string;
  establishedDate?: string;
  leaderName?: string;
  memberCount: number;
  budget?: number;
  status: 'active' | 'inactive';
}

export default function AssociationsPage() {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    parishId: '',
    patronSaint: '',
    establishedDate: '',
    leaderName: '',
    memberCount: 0,
    budget: 0,
  });

  useEffect(() => {
    fetchAssociations();
  }, []);

  const fetchAssociations = async () => {
    try {
      const res = await fetch('/api/associations');
      if (res.ok) {
        const data = await res.json();
        setAssociations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching associations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/associations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: 'active' }),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        fetchAssociations();
      }
    } catch (error) {
      console.error('Error creating association:', error);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const filteredAssociations = associations.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.parishName?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold">Quản lý Hội đoàn</h1>
          <p className="text-gray-600">Quản lý các Hội đoàn trong Giáo phận</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Thêm Hội đoàn</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Hội đoàn mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Tên Hội đoàn *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Legio Mariae"
                  required
                />
              </div>
              <div>
                <Label>Bổn mạng</Label>
                <Input
                  value={formData.patronSaint}
                  onChange={(e) => setFormData({ ...formData, patronSaint: e.target.value })}
                  placeholder="VD: Đức Mẹ"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ngày thành lập</Label>
                  <Input
                    type="date"
                    value={formData.establishedDate}
                    onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Số thành viên</Label>
                  <Input
                    type="number"
                    value={formData.memberCount}
                    onChange={(e) => setFormData({ ...formData, memberCount: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label>Trưởng ban</Label>
                <Input
                  value={formData.leaderName}
                  onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                  placeholder="Tên trưởng ban"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">Lưu</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{associations.length}</div>
            <p className="text-sm text-gray-600">Tổng hội đoàn</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {associations.filter(a => a.status === 'active').length}
            </div>
            <p className="text-sm text-gray-600">Đang hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {associations.reduce((sum, a) => sum + a.memberCount, 0)}
            </div>
            <p className="text-sm text-gray-600">Tổng thành viên</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(associations.map(a => a.parishId)).size}
            </div>
            <p className="text-sm text-gray-600">Giáo xứ</p>
          </CardContent>
        </Card>
      </div>

      {/* Associations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách Hội đoàn ({filteredAssociations.length})</CardTitle>
            <Input
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredAssociations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">👥</p>
              <p>Chưa có hội đoàn nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên Hội đoàn</TableHead>
                  <TableHead>Giáo xứ</TableHead>
                  <TableHead>Bổn mạng</TableHead>
                  <TableHead>Trưởng ban</TableHead>
                  <TableHead className="text-right">Thành viên</TableHead>
                  <TableHead className="text-right">Ngân sách</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssociations.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>{a.parishName || '-'}</TableCell>
                    <TableCell>{a.patronSaint || '-'}</TableCell>
                    <TableCell>{a.leaderName || '-'}</TableCell>
                    <TableCell className="text-right">{a.memberCount}</TableCell>
                    <TableCell className="text-right">{formatCurrency(a.budget)}</TableCell>
                    <TableCell>
                      <Badge className={
                        a.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }>
                        {a.status === 'active' ? 'Hoạt động' : 'Ngưng'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Chi tiết</Button>
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
