'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectFormDialog } from '@/components/admin/ProjectFormDialog';
import { ProjectDetailModal } from '@/components/admin/ProjectDetailModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Edit, Trash2 } from 'lucide-react';

interface Project {
  _id: string;
  projectName: string;
  parishId: string;
  parishName?: string;
  projectType: 'construction' | 'renovation';
  description?: string;
  budget: number;
  startDate?: string;
  expectedEnd?: string;
  actualEnd?: string;
  permitStatus: 'pending' | 'approved' | 'rejected';
  progress: number;
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
  images?: string[];
}

const statusConfig = {
  planning: { label: 'Đang lập kế hoạch', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'Đang thi công', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

const permitConfig = {
  pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Đã có phép', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

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
      toast.error('Lỗi khi tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedProject(null);
    setFormOpen(true);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormOpen(true);
    setDetailOpen(false);
  };

  const handleViewDetail = (project: Project) => {
    setSelectedProject(project);
    setDetailOpen(true);
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
    setDetailOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      const res = await fetch(`/api/projects/${projectToDelete._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('Xóa dự án thành công');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Lỗi khi xóa dự án');
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const filteredProjects = projects.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch = !searchTerm ||
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.parishName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);

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
          <h1 className="text-2xl font-bold">Công trình & Dự án</h1>
          <p className="text-gray-600">Quản lý các công trình xây dựng trong Giáo phận</p>
        </div>
        <Button onClick={handleCreate}>+ Thêm dự án</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
            <p className="text-sm text-gray-600">Tổng dự án</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {projects.filter(p => p.status === 'in_progress').length}
            </div>
            <p className="text-sm text-gray-600">Đang thi công</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalBudget)}</div>
            <p className="text-sm text-gray-600">Tổng ngân sách</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách Dự án ({filteredProjects.length})</CardTitle>
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
                  <SelectItem value="planning">Lập kế hoạch</SelectItem>
                  <SelectItem value="in_progress">Đang thi công</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">🏗️</p>
              <p>Chưa có dự án nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên dự án</TableHead>
                  <TableHead>Giáo xứ</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="text-right">Ngân sách</TableHead>
                  <TableHead>Tiến độ</TableHead>
                  <TableHead>Phép XD</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-medium">{p.projectName}</TableCell>
                    <TableCell>{p.parishName || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {p.projectType === 'construction' ? 'Xây mới' : 'Sửa chữa'}
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(p)}>
                          Chi tiết
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(p)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        project={selectedProject}
        onSuccess={fetchProjects}
      />

      <ProjectDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        project={selectedProject}
        onEdit={() => handleEdit(selectedProject!)}
        onDelete={() => handleDeleteClick(selectedProject!)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa dự án <strong>{projectToDelete?.projectName}</strong>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
