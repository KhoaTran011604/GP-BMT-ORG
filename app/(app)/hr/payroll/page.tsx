'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Payroll {
  _id: string;
  staffId: string;
  staffName: string;
  staffCode: string;
  period: string;
  basicSalary: number;
  responsibilityAllowance: number;
  mealAllowance: number;
  transportAllowance: number;
  advance: number;
  deductions: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid';
  approvedBy?: string;
  paidAt?: string;
}

const currentYear = new Date().getFullYear();
const months = Array.from({ length: 12 }, (_, i) => ({
  value: `${String(i + 1).padStart(2, '0')}/${currentYear}`,
  label: `Thang ${i + 1}/${currentYear}`
}));

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(months[new Date().getMonth()].value);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPayrolls();
  }, [selectedPeriod]);

  const fetchPayrolls = async () => {
    try {
      const res = await fetch(`/api/payroll?period=${selectedPeriod}`);
      if (res.ok) {
        const data = await res.json();
        setPayrolls(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching payrolls:', error);
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

  const filteredPayrolls = payrolls.filter(p => {
    return statusFilter === 'all' || p.status === statusFilter;
  });

  const totals = {
    basicSalary: filteredPayrolls.reduce((sum, p) => sum + p.basicSalary, 0),
    allowances: filteredPayrolls.reduce((sum, p) => sum + p.responsibilityAllowance + p.mealAllowance + p.transportAllowance, 0),
    deductions: filteredPayrolls.reduce((sum, p) => sum + p.deductions + p.advance, 0),
    netSalary: filteredPayrolls.reduce((sum, p) => sum + p.netSalary, 0),
  };

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
          <h1 className="text-2xl font-bold">Bang luong</h1>
          <p className="text-gray-600">Quan ly bang luong hang thang</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button>Tao bang luong</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{filteredPayrolls.length}</div>
            <p className="text-sm text-gray-600">Nhan vien</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.basicSalary)}</div>
            <p className="text-sm text-gray-600">Tong luong co ban</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totals.allowances)}</div>
            <p className="text-sm text-gray-600">Tong phu cap</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totals.netSalary)}</div>
            <p className="text-sm text-gray-600">Tong thuc linh</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bang luong ky {selectedPeriod}</CardTitle>
              <CardDescription>Chi tiet luong tung nhan vien</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tat ca</SelectItem>
                  <SelectItem value="draft">Ban nhap</SelectItem>
                  <SelectItem value="approved">Da duyet</SelectItem>
                  <SelectItem value="paid">Da chi</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">Xuat Excel</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPayrolls.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">💰</p>
              <p>Chua co du lieu bang luong cho ky nay</p>
              <Button className="mt-4">Tao bang luong moi</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ma NV</TableHead>
                    <TableHead>Ho Ten</TableHead>
                    <TableHead className="text-right">Luong CB</TableHead>
                    <TableHead className="text-right">PC Trach nhiem</TableHead>
                    <TableHead className="text-right">PC An uong</TableHead>
                    <TableHead className="text-right">PC Xang xe</TableHead>
                    <TableHead className="text-right">Tam ung</TableHead>
                    <TableHead className="text-right">Khau tru</TableHead>
                    <TableHead className="text-right">Thuc linh</TableHead>
                    <TableHead>Trang thai</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayrolls.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell className="font-mono">{p.staffCode}</TableCell>
                      <TableCell className="font-medium">{p.staffName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.basicSalary)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.responsibilityAllowance)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.mealAllowance)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.transportAllowance)}</TableCell>
                      <TableCell className="text-right text-red-600">-{formatCurrency(p.advance)}</TableCell>
                      <TableCell className="text-right text-red-600">-{formatCurrency(p.deductions)}</TableCell>
                      <TableCell className="text-right font-bold text-green-600">{formatCurrency(p.netSalary)}</TableCell>
                      <TableCell>
                        <Badge className={
                          p.status === 'paid' ? 'bg-green-100 text-green-800' :
                          p.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {p.status === 'paid' ? 'Da chi' :
                           p.status === 'approved' ? 'Da duyet' : 'Ban nhap'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Chi tiet</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals Row */}
                  <TableRow className="bg-gray-50 font-bold">
                    <TableCell colSpan={2}>TONG CONG</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.basicSalary)}</TableCell>
                    <TableCell className="text-right" colSpan={3}>{formatCurrency(totals.allowances)}</TableCell>
                    <TableCell className="text-right text-red-600" colSpan={2}>-{formatCurrency(totals.deductions)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(totals.netSalary)}</TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Actions */}
      {filteredPayrolls.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Phe duyet bang luong</h3>
                <p className="text-sm text-gray-600">
                  {payrolls.filter(p => p.status === 'draft').length} phieu luong cho duyet
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Xem truoc</Button>
                <Button>Phe duyet tat ca</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
