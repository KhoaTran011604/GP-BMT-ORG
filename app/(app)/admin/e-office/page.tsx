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
  certificate: { label: 'Xin giấy chứng nhận', icon: '📄' },
  permission: { label: 'Xin phép', icon: '✅' },
  report: { label: 'Báo cáo', icon: '📊' },
  other: { label: 'Khác', icon: '📋' },
};

const statusConfig = {
  pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
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
          <h1 className="text-2xl font-bold">E-Office (Đơn từ)</h1>
          <p className="text-gray-600">Quản lý đơn từ và yêu cầu từ các Giáo xứ</p>
        </div>
        <Button>+ Tạo đơn mới</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
            <p className="text-sm text-gray-600">Tổng đơn từ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-sm text-gray-600">Chờ xử lý</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {requests.filter(r => r.status === 'processing').length}
            </div>
            <p className="text-sm text-gray-600">Đang xử lý</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'approved').length}
            </div>
            <p className="text-sm text-gray-600">Đã duyệt</p>
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
                {requests.filter(r => r.requestType === key).length} đơn
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách đơn từ ({filteredRequests.length})</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">📋</p>
              <p>Chưa có đơn từ nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Loại đơn</TableHead>
                  <TableHead>Giáo xứ</TableHead>
                  <TableHead>Người nộp</TableHead>
                  <TableHead>Ngày nộp</TableHead>
                  <TableHead>Bước</TableHead>
                  <TableHead>Trạng thái</TableHead>
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
                      <Badge variant="outline">Bước {r.workflowStep}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[r.status].color}>
                        {statusConfig[r.status].label}
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
