'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Assignment {
  _id: string;
  clergyId: string;
  clergyName: string;
  parishId: string;
  parishName: string;
  role: 'cha_xu' | 'cha_pho' | 'quan_nhiem' | 'dac_trach';
  startDate: string;
  endDate?: string;
  decreeNo?: string;
  notes?: string;
  isCurrent: boolean;
}

const roleLabels = {
  cha_xu: { label: 'Cha xứ', color: 'bg-green-100 text-green-800' },
  cha_pho: { label: 'Cha phó', color: 'bg-blue-100 text-blue-800' },
  quan_nhiem: { label: 'Quản nhiệm', color: 'bg-purple-100 text-purple-800' },
  dac_trach: { label: 'Đặc trách', color: 'bg-orange-100 text-orange-800' },
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCurrent, setShowCurrent] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/assignments');
      if (res.ok) {
        const data = await res.json();
        setAssignments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesRole = roleFilter === 'all' || a.role === roleFilter;
    const matchesCurrent = !showCurrent || a.isCurrent;
    const matchesSearch = !searchTerm ||
      a.clergyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.parishName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesCurrent && matchesSearch;
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
          <h1 className="text-2xl font-bold">Lịch sử Bổ nhiệm</h1>
          <p className="text-gray-600">Quản lý bổ nhiệm Linh mục tại các Giáo xứ</p>
        </div>
        <Button>+ Thêm Bổ nhiệm</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {assignments.filter(a => a.isCurrent).length}
            </div>
            <p className="text-sm text-gray-600">Bổ nhiệm hiện tại</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {assignments.filter(a => a.isCurrent && a.role === 'cha_xu').length}
            </div>
            <p className="text-sm text-gray-600">Cha xứ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {assignments.filter(a => a.isCurrent && a.role === 'cha_pho').length}
            </div>
            <p className="text-sm text-gray-600">Cha phó</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {assignments.filter(a => a.isCurrent && (a.role === 'quan_nhiem' || a.role === 'dac_trach')).length}
            </div>
            <p className="text-sm text-gray-600">Quản nhiệm/Đặc trách</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tìm kiếm Linh mục, Giáo xứ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Chức vụ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="cha_xu">Cha xứ</SelectItem>
                <SelectItem value="cha_pho">Cha phó</SelectItem>
                <SelectItem value="quan_nhiem">Quản nhiệm</SelectItem>
                <SelectItem value="dac_trach">Đặc trách</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showCurrent ? 'default' : 'outline'}
              onClick={() => setShowCurrent(!showCurrent)}
            >
              {showCurrent ? 'Chỉ hiện tại' : 'Tất cả'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Bổ nhiệm ({filteredAssignments.length})</CardTitle>
          <CardDescription>
            {showCurrent ? 'Chỉ hiển thị bổ nhiệm hiện tại' : 'Hiển thị tất cả lịch sử bổ nhiệm'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">📋</p>
              <p>Không có dữ liệu bổ nhiệm</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Linh mục</TableHead>
                  <TableHead>Giáo xứ</TableHead>
                  <TableHead>Chức vụ</TableHead>
                  <TableHead>Ngày bắt đầu</TableHead>
                  <TableHead>Ngày kết thúc</TableHead>
                  <TableHead>Số QD</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="font-medium">{a.clergyName}</TableCell>
                    <TableCell>{a.parishName}</TableCell>
                    <TableCell>
                      <Badge className={roleLabels[a.role]?.color || 'bg-gray-100'}>
                        {roleLabels[a.role]?.label || a.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(a.startDate)}</TableCell>
                    <TableCell>{formatDate(a.endDate || '')}</TableCell>
                    <TableCell className="font-mono">{a.decreeNo || '-'}</TableCell>
                    <TableCell>
                      <Badge className={a.isCurrent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {a.isCurrent ? 'Hiện tại' : 'Đã kết thúc'}
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
