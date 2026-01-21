'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SubParish {
  _id: string;
  subParishCode: string;
  subParishName: string;
  parishId: string;
  parishName?: string;
  patronSaint?: string;
  address?: string;
  status: string;
}

interface Parish {
  _id: string;
  parishCode: string;
  parishName: string;
}

export default function SubParishesPage() {
  const [subParishes, setSubParishes] = useState<SubParish[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    subParishCode: '',
    subParishName: '',
    parishId: '',
    patronSaint: '',
    address: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subParishRes, parishRes] = await Promise.all([
        fetch('/api/sub-parishes'),
        fetch('/api/parishes')
      ]);

      if (subParishRes.ok) {
        const data = await subParishRes.json();
        setSubParishes(Array.isArray(data) ? data : []);
      }

      if (parishRes.ok) {
        const data = await parishRes.json();
        setParishes(Array.isArray(data) ? data : []);
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
      const res = await fetch('/api/sub-parishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        setFormData({
          subParishCode: '',
          subParishName: '',
          parishId: '',
          patronSaint: '',
          address: '',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating sub-parish:', error);
    }
  };

  const filteredSubParishes = subParishes.filter(sp =>
    sp.subParishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sp.subParishCode.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold">Giáo họ trực thuộc</h1>
          <p className="text-gray-600">Quản lý danh sách các giáo họ trong Giáo phận</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Thêm Giáo họ</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Giáo họ mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mã Giáo họ *</Label>
                  <Input
                    value={formData.subParishCode}
                    onChange={(e) => setFormData({ ...formData, subParishCode: e.target.value })}
                    placeholder="VD: GH001"
                    required
                  />
                </div>
                <div>
                  <Label>Tên Giáo họ *</Label>
                  <Input
                    value={formData.subParishName}
                    onChange={(e) => setFormData({ ...formData, subParishName: e.target.value })}
                    placeholder="VD: Giáo họ Thánh Tâm"
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
                <Label>Bổn mạng</Label>
                <Input
                  value={formData.patronSaint}
                  onChange={(e) => setFormData({ ...formData, patronSaint: e.target.value })}
                  placeholder="VD: Thánh Giuse"
                />
              </div>
              <div>
                <Label>Địa chỉ</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Địa chỉ giáo họ"
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách Giáo họ ({filteredSubParishes.length})</CardTitle>
            <Input
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubParishes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">🏠</p>
              <p>Chưa có giáo họ nào được đăng ký</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên Giáo họ</TableHead>
                  <TableHead>Thuộc Giáo xứ</TableHead>
                  <TableHead>Bổn mạng</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubParishes.map((sp) => (
                  <TableRow key={sp._id}>
                    <TableCell className="font-mono">{sp.subParishCode}</TableCell>
                    <TableCell className="font-medium">{sp.subParishName}</TableCell>
                    <TableCell>{sp.parishName || '-'}</TableCell>
                    <TableCell>{sp.patronSaint || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">{sp.address || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        sp.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {sp.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                      </span>
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
