'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Contract {
  _id: string;
  contractNo: string;
  staffId: string;
  staffName: string;
  contractType: 'full_time' | 'part_time' | 'fixed_term' | 'seasonal';
  startDate: string;
  endDate?: string;
  basicSalary: number;
  status: 'active' | 'expired' | 'terminated';
}

const contractTypes = {
  full_time: { label: 'Khong xac dinh thoi han', color: 'bg-green-100 text-green-800' },
  part_time: { label: 'Ban thoi gian', color: 'bg-blue-100 text-blue-800' },
  fixed_term: { label: 'Xac dinh thoi han', color: 'bg-purple-100 text-purple-800' },
  seasonal: { label: 'Thoi vu', color: 'bg-orange-100 text-orange-800' },
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await fetch('/api/contracts');
      if (res.ok) {
        const data = await res.json();
        setContracts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const filteredContracts = contracts.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch = !searchTerm ||
      c.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contractNo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate contracts expiring soon (within 30 days)
  const expiringContracts = contracts.filter(c => {
    if (!c.endDate || c.status !== 'active') return false;
    const endDate = new Date(c.endDate);
    const today = new Date();
    const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
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
          <h1 className="text-2xl font-bold">Hop dong Lao dong</h1>
          <p className="text-gray-600">Quan ly hop dong lao dong cua nhan vien</p>
        </div>
        <Button>+ Tao Hop dong moi</Button>
      </div>

      {/* Alert for expiring contracts */}
      {expiringContracts.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-amber-800">
                  Co {expiringContracts.length} hop dong sap het han (trong 30 ngay)
                </h3>
                <p className="text-sm text-amber-700">
                  Vui long kiem tra va gia han neu can thiet
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{contracts.length}</div>
            <p className="text-sm text-gray-600">Tong hop dong</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {contracts.filter(c => c.status === 'active').length}
            </div>
            <p className="text-sm text-gray-600">Dang hieu luc</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{expiringContracts.length}</div>
            <p className="text-sm text-gray-600">Sap het han</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {contracts.filter(c => c.status === 'expired').length}
            </div>
            <p className="text-sm text-gray-600">Da het han</p>
          </CardContent>
        </Card>
      </div>

      {/* Contract List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sach Hop dong ({filteredContracts.length})</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Tim kiem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tat ca</SelectItem>
                  <SelectItem value="active">Dang hieu luc</SelectItem>
                  <SelectItem value="expired">Da het han</SelectItem>
                  <SelectItem value="terminated">Da cham dut</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredContracts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">📄</p>
              <p>Chua co hop dong nao</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>So Hop dong</TableHead>
                  <TableHead>Nhan vien</TableHead>
                  <TableHead>Loai HD</TableHead>
                  <TableHead>Ngay bat dau</TableHead>
                  <TableHead>Ngay ket thuc</TableHead>
                  <TableHead className="text-right">Luong co ban</TableHead>
                  <TableHead>Trang thai</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-mono font-medium">{c.contractNo}</TableCell>
                    <TableCell>{c.staffName}</TableCell>
                    <TableCell>
                      <Badge className={contractTypes[c.contractType]?.color || 'bg-gray-100'}>
                        {contractTypes[c.contractType]?.label || c.contractType}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(c.startDate)}</TableCell>
                    <TableCell>{formatDate(c.endDate || '')}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(c.basicSalary)}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        c.status === 'active' ? 'bg-green-100 text-green-800' :
                        c.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {c.status === 'active' ? 'Hieu luc' :
                         c.status === 'expired' ? 'Het han' : 'Cham dut'}
                      </Badge>
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
