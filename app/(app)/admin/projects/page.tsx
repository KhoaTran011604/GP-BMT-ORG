'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Project {
  _id: string;
  projectName: string;
  parishId: string;
  parishName?: string;
  projectType: 'construction' | 'renovation';
  description?: string;
  budget: number;
  actualCost?: number;
  startDate?: string;
  expectedEnd?: string;
  actualEnd?: string;
  permitStatus: 'pending' | 'approved' | 'rejected';
  progress: number;
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
}

const statusConfig = {
  planning: { label: 'Dang lap ke hoach', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'Dang thi cong', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Hoan thanh', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Da huy', color: 'bg-red-100 text-red-800' },
};

const permitConfig = {
  pending: { label: 'Cho duyet', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Da co phep', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Tu choi', color: 'bg-red-100 text-red-800' },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const filteredProjects = projects.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch = !searchTerm ||
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.parishName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalActualCost = projects.reduce((sum, p) => sum + (p.actualCost || 0), 0);

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
          <h1 className="text-2xl font-bold">Cong trinh & Du an</h1>
          <p className="text-gray-600">Quan ly cac cong trinh xay dung trong Giao phan</p>
        </div>
        <Button>+ Them du an</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
            <p className="text-sm text-gray-600">Tong du an</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {projects.filter(p => p.status === 'in_progress').length}
            </div>
            <p className="text-sm text-gray-600">Dang thi cong</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalBudget)}</div>
            <p className="text-sm text-gray-600">Tong ngan sach</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalActualCost)}</div>
            <p className="text-sm text-gray-600">Tong chi thuc te</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sach Du an ({filteredProjects.length})</CardTitle>
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
                  <SelectItem value="planning">Lap ke hoach</SelectItem>
                  <SelectItem value="in_progress">Dang thi cong</SelectItem>
                  <SelectItem value="completed">Hoan thanh</SelectItem>
                  <SelectItem value="cancelled">Da huy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">🏗️</p>
              <p>Chua co du an nao</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ten du an</TableHead>
                  <TableHead>Giao xu</TableHead>
                  <TableHead>Loai</TableHead>
                  <TableHead className="text-right">Ngan sach</TableHead>
                  <TableHead>Tien do</TableHead>
                  <TableHead>Phep XD</TableHead>
                  <TableHead>Trang thai</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-medium">{p.projectName}</TableCell>
                    <TableCell>{p.parishName || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {p.projectType === 'construction' ? 'Xay moi' : 'Sua chua'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(p.budget)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={p.progress} className="w-20" />
                        <span className="text-sm">{p.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={permitConfig[p.permitStatus].color}>
                        {permitConfig[p.permitStatus].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[p.status].color}>
                        {statusConfig[p.status].label}
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
