'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Request {
  _id: string;
  requestId: string;
  requestType: string;
  parishId: string;
  parishName?: string;
  submittedBy: string;
  submitterName?: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  workflowStep: number;
  createdAt: string;
  updatedAt: string;
}

const requestTypes = {
  certificate: { label: 'Xin giay chung nhan', icon: '📄' },
  permission: { label: 'Xin phep', icon: '✅' },
  report: { label: 'Bao cao', icon: '📊' },
  other: { label: 'Khac', icon: '📋' },
};

const statusConfig = {
  pending: { label: 'Cho xu ly', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Dang xu ly', color: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Da duyet', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Tu choi', color: 'bg-red-100 text-red-800' },
};

export default function EOfficePage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const filteredRequests = requests.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch = !searchTerm ||
      r.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.parishName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
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
          <h1 className="text-2xl font-bold">E-Office (Don tu)</h1>
          <p className="text-gray-600">Quan ly don tu va yeu cau tu cac Giao xu</p>
        </div>
        <Button>+ Tao don moi</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
            <p className="text-sm text-gray-600">Tong don tu</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-sm text-gray-600">Cho xu ly</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {requests.filter(r => r.status === 'processing').length}
            </div>
            <p className="text-sm text-gray-600">Dang xu ly</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'approved').length}
            </div>
            <p className="text-sm text-gray-600">Da duyet</p>
          </CardContent>
        </Card>
      </div>

      {/* Request Types */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(requestTypes).map(([key, type]) => (
          <Card key={key} className="hover:shadow-md cursor-pointer transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">{type.icon}</div>
              <h3 className="font-medium">{type.label}</h3>
              <p className="text-sm text-gray-500">
                {requests.filter(r => r.requestType === key).length} don
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sach don tu ({filteredRequests.length})</CardTitle>
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
                  <SelectItem value="pending">Cho xu ly</SelectItem>
                  <SelectItem value="processing">Dang xu ly</SelectItem>
                  <SelectItem value="approved">Da duyet</SelectItem>
                  <SelectItem value="rejected">Tu choi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">📋</p>
              <p>Chua co don tu nao</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ma don</TableHead>
                  <TableHead>Loai don</TableHead>
                  <TableHead>Giao xu</TableHead>
                  <TableHead>Nguoi nop</TableHead>
                  <TableHead>Ngay nop</TableHead>
                  <TableHead>Buoc</TableHead>
                  <TableHead>Trang thai</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-mono">{r.requestId}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {requestTypes[r.requestType as keyof typeof requestTypes]?.icon}
                        {requestTypes[r.requestType as keyof typeof requestTypes]?.label || r.requestType}
                      </span>
                    </TableCell>
                    <TableCell>{r.parishName || '-'}</TableCell>
                    <TableCell>{r.submitterName || '-'}</TableCell>
                    <TableCell>{formatDate(r.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Buoc {r.workflowStep}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[r.status].color}>
                        {statusConfig[r.status].label}
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
