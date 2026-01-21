'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface MarriageRecord {
  _id: string;
  groomName: string;
  groomParish: string;
  brideName: string;
  brideParish: string;
  marriageDate: string;
  marriagePlace: string;
  minister: string;
  witness1: string;
  witness2: string;
  dispensation?: string;
  registerBook: string;
  registerNo: string;
}

export default function MarriagePage() {
  const [records, setRecords] = useState<MarriageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    groomName: '',
    groomParish: '',
    brideName: '',
    brideParish: '',
    marriageDate: '',
    marriagePlace: '',
    minister: '',
    witness1: '',
    witness2: '',
    dispensation: '',
    registerBook: '',
    registerNo: '',
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/sacraments/marriage');
      if (res.ok) {
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching marriage records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sacraments/marriage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        fetchRecords();
      }
    } catch (error) {
      console.error('Error creating marriage record:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const filteredRecords = records.filter(r =>
    r.groomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.brideName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          <h1 className="text-2xl font-bold">So Hon phoi</h1>
          <p className="text-gray-600">Quan ly so bo Bi tich Hon phoi</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Them ban ghi</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Them ban ghi Hon phoi</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Chu re</h3>
                  <div>
                    <Label>Ho va Ten *</Label>
                    <Input
                      value={formData.groomName}
                      onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                      placeholder="Ten chu re"
                      required
                    />
                  </div>
                  <div>
                    <Label>Giao xu *</Label>
                    <Input
                      value={formData.groomParish}
                      onChange={(e) => setFormData({ ...formData, groomParish: e.target.value })}
                      placeholder="Giao xu chu re"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-4 p-4 bg-pink-50 rounded-lg">
                  <h3 className="font-semibold text-pink-800">Co dau</h3>
                  <div>
                    <Label>Ho va Ten *</Label>
                    <Input
                      value={formData.brideName}
                      onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                      placeholder="Ten co dau"
                      required
                    />
                  </div>
                  <div>
                    <Label>Giao xu *</Label>
                    <Input
                      value={formData.brideParish}
                      onChange={(e) => setFormData({ ...formData, brideParish: e.target.value })}
                      placeholder="Giao xu co dau"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ngay cu hanh *</Label>
                  <Input
                    type="date"
                    value={formData.marriageDate}
                    onChange={(e) => setFormData({ ...formData, marriageDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Noi cu hanh *</Label>
                  <Input
                    value={formData.marriagePlace}
                    onChange={(e) => setFormData({ ...formData, marriagePlace: e.target.value })}
                    placeholder="VD: Nha tho Chinh toa"
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Linh muc chung hon *</Label>
                <Input
                  value={formData.minister}
                  onChange={(e) => setFormData({ ...formData, minister: e.target.value })}
                  placeholder="Ten Linh muc"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nguoi chung 1 *</Label>
                  <Input
                    value={formData.witness1}
                    onChange={(e) => setFormData({ ...formData, witness1: e.target.value })}
                    placeholder="Ten nguoi chung 1"
                    required
                  />
                </div>
                <div>
                  <Label>Nguoi chung 2 *</Label>
                  <Input
                    value={formData.witness2}
                    onChange={(e) => setFormData({ ...formData, witness2: e.target.value })}
                    placeholder="Ten nguoi chung 2"
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Phep chuan (neu co)</Label>
                <Textarea
                  value={formData.dispensation}
                  onChange={(e) => setFormData({ ...formData, dispensation: e.target.value })}
                  placeholder="Ghi chu ve phep chuan neu co"
                />
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
        <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white">
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{records.length}</div>
            <p className="text-sm text-white/80">Tong so ban ghi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {records.filter(r => new Date(r.marriageDate).getFullYear() === new Date().getFullYear()).length}
            </div>
            <p className="text-sm text-gray-600">Hon phoi nam nay</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {records.filter(r => r.dispensation).length}
            </div>
            <p className="text-sm text-gray-600">Co phep chuan</p>
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
              <p className="text-4xl mb-4">💒</p>
              <p>Chua co ban ghi Hon phoi nao</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>So so/STT</TableHead>
                  <TableHead>Chu re</TableHead>
                  <TableHead>Co dau</TableHead>
                  <TableHead>Ngay cu hanh</TableHead>
                  <TableHead>Noi cu hanh</TableHead>
                  <TableHead>Linh muc</TableHead>
                  <TableHead>Phep chuan</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-mono">{r.registerBook}/{r.registerNo}</TableCell>
                    <TableCell>
                      <div className="font-medium">{r.groomName}</div>
                      <div className="text-xs text-gray-500">{r.groomParish}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{r.brideName}</div>
                      <div className="text-xs text-gray-500">{r.brideParish}</div>
                    </TableCell>
                    <TableCell>{formatDate(r.marriageDate)}</TableCell>
                    <TableCell>{r.marriagePlace}</TableCell>
                    <TableCell>{r.minister}</TableCell>
                    <TableCell>
                      {r.dispensation ? (
                        <span className="text-xs text-orange-600">Co</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </TableCell>
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
