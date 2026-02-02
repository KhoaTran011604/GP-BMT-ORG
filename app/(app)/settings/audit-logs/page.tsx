'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  History,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Eye,
  Monitor,
  Globe,
  Clock,
  User,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { FormSection, FormField, FormLabel, FormGrid, FormInfoBox } from '@/components/ui/form-section';

interface AuditLog {
  _id: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'approve';
  module: string;
  recordId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    _id: string;
    fullName: string;
    email: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const actionConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  create: { label: 'Tạo mới', color: 'bg-green-100 text-green-800', icon: <Plus size={14} /> },
  update: { label: 'Cập nhật', color: 'bg-blue-100 text-blue-800', icon: <Pencil size={14} /> },
  delete: { label: 'Xóa', color: 'bg-red-100 text-red-800', icon: <Trash2 size={14} /> },
  approve: { label: 'Phê duyệt', color: 'bg-purple-100 text-purple-800', icon: <CheckCircle size={14} /> },
};

const moduleLabels: Record<string, string> = {
  parishes: 'Giáo xứ',
  users: 'Người dùng',
  incomes: 'Thu nhập',
  expenses: 'Chi phí',
  funds: 'Quỹ',
  staff: 'Nhân sự',
  people: 'Giáo dân',
};

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    module: 'all',
    action: 'all',
    startDate: '',
    endDate: '',
    search: '',
  });

  // Detail dialog
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const canView = user?.role === 'super_admin' || user?.role === 'cha_quan_ly';

  useEffect(() => {
    if (canView) {
      fetchLogs();
    }
  }, [pagination.page, filters, canView]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.module !== 'all') params.append('module', filters.module);
      if (filters.action !== 'all') params.append('action', filters.action);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setLogs(result.data || []);
        setPagination(prev => ({ ...prev, ...result.pagination }));
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const calculateDiff = (oldValue?: Record<string, any>, newValue?: Record<string, any>) => {
    const diff: { field: string; oldVal: any; newVal: any }[] = [];

    if (!oldValue && !newValue) return diff;

    const allKeys = new Set([
      ...Object.keys(oldValue || {}),
      ...Object.keys(newValue || {}),
    ]);

    // Only skip _id and password
    const skipFields = ['_id', 'password'];

    for (const key of allKeys) {
      if (skipFields.includes(key)) continue;

      const oldVal = oldValue?.[key];
      const newVal = newValue?.[key];

      const oldStr = JSON.stringify(oldVal);
      const newStr = JSON.stringify(newVal);

      if (oldStr !== newStr) {
        diff.push({ field: key, oldVal, newVal });
      }
    }

    return diff;
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Generate git-style unified diff
  const generateUnifiedDiff = (oldValue?: Record<string, any>, newValue?: Record<string, any>) => {
    const lines: { type: 'header' | 'unchanged' | 'removed' | 'added'; content: string }[] = [];

    if (!oldValue && !newValue) return lines;

    const allKeys = Array.from(new Set([
      ...Object.keys(oldValue || {}),
      ...Object.keys(newValue || {}),
    ])).sort();

    const skipFields = ['_id', 'password'];

    for (const key of allKeys) {
      if (skipFields.includes(key)) continue;

      const oldVal = oldValue?.[key];
      const newVal = newValue?.[key];

      const oldStr = formatValue(oldVal);
      const newStr = formatValue(newVal);

      if (oldStr === newStr) {
        lines.push({ type: 'unchanged', content: `  "${key}": ${oldStr}` });
      } else {
        if (oldVal !== undefined) {
          lines.push({ type: 'removed', content: `- "${key}": ${oldStr}` });
        }
        if (newVal !== undefined) {
          lines.push({ type: 'added', content: `+ "${key}": ${newStr}` });
        }
      }
    }

    return lines;
  };

  const openDetailDialog = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailDialog(true);
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <History className="mx-auto text-gray-300 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-600">Không có quyền truy cập</h2>
          <p className="text-gray-500">Chỉ Super Admin và Cha Quản lý mới có quyền xem nhật ký hệ thống.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header - Elderly friendly */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <History className="text-blue-600" size={32} />
            Nhật ký hệ thống
          </h1>
          <p className="text-base text-gray-600 mt-1">Theo dõi tất cả hoạt động trong hệ thống</p>
        </div>
      </div>

      {/* Stats - Larger cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(actionConfig).map(([key, config]) => (
          <Card key={key} className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${config.color}`}>
                  {config.icon}
                </div>
                <div>
                  <p className="text-base text-gray-600">{config.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {logs.filter(l => l.action === key).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters - Larger inputs */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Filter size={24} />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Module</Label>
              <Select
                value={filters.module}
                onValueChange={(value) => {
                  setFilters({ ...filters, module: value });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="py-3 text-base">Tất cả</SelectItem>
                  {Object.entries(moduleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="py-3 text-base">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Hành động</Label>
              <Select
                value={filters.action}
                onValueChange={(value) => {
                  setFilters({ ...filters, action: value });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="py-3 text-base">Tất cả</SelectItem>
                  {Object.entries(actionConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="py-3 text-base">{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Từ ngày</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setFilters({ ...filters, startDate: e.target.value });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Đến ngày</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setFilters({ ...filters, endDate: e.target.value });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">&nbsp;</Label>
              <Button
                variant="outline"
                className="w-full h-12 text-base"
                onClick={() => {
                  setFilters({ module: 'all', action: 'all', startDate: '', endDate: '', search: '' });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table - Larger fonts */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Danh sách nhật ký ({pagination.total})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <History className="mx-auto mb-4 text-gray-300" size={64} />
              <p className="text-lg">Chưa có nhật ký nào</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-base font-semibold py-4">Thời gian</TableHead>
                    <TableHead className="text-base font-semibold py-4">Người thực hiện</TableHead>
                    <TableHead className="text-base font-semibold py-4">Hành động</TableHead>
                    <TableHead className="text-base font-semibold py-4">Module</TableHead>
                    <TableHead className="text-base font-semibold py-4">IP</TableHead>
                    <TableHead className="text-base font-semibold py-4 text-right">Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id} className="hover:bg-gray-50">
                      <TableCell className="py-4 text-base text-gray-600">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-800 text-sm font-semibold">
                              {log.user ? getInitials(log.user.fullName) : '??'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-base text-gray-900">{log.user?.fullName || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{log.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={`${actionConfig[log.action]?.color || 'bg-gray-100'} flex items-center gap-1 w-fit text-sm px-3 py-1`}>
                          {actionConfig[log.action]?.icon}
                          {actionConfig[log.action]?.label || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="text-sm px-3 py-1">
                          {moduleLabels[log.module] || log.module}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-base text-gray-500">
                        {log.ipAddress || '-'}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailDialog(log)}
                          className="h-10 px-4 text-sm"
                        >
                          <Eye size={18} className="mr-2" />
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination - Larger buttons */}
              <div className="flex flex-col md:flex-row items-center justify-between mt-6 pt-6 border-t gap-4">
                <p className="text-base text-gray-600">
                  Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                    className="h-12 px-4 text-base"
                  >
                    <ChevronLeft size={20} className="mr-1" />
                    Trước
                  </Button>
                  <span className="text-base font-medium px-4">
                    Trang {pagination.page} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="h-12 px-4 text-base"
                  >
                    Sau
                    <ChevronRight size={20} className="ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <History className="text-blue-600" size={24} />
              Chi tiết nhật ký
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6 mt-4">
              {/* Section 1: Thông tin chung */}
              <FormSection
                title="Thông tin chung"
                description="Thông tin cơ bản về hoạt động"
                icon={<Clock size={20} />}
              >
                <FormGrid columns={2}>
                  <FormField>
                    <FormLabel>Thời gian</FormLabel>
                    <div className="h-12 px-4 flex items-center bg-gray-100 rounded-lg text-base font-medium">
                      {formatDate(selectedLog.createdAt)}
                    </div>
                  </FormField>
                  <FormField>
                    <FormLabel>Hành động</FormLabel>
                    <div className="h-12 px-4 flex items-center bg-gray-100 rounded-lg">
                      <Badge className={`${actionConfig[selectedLog.action]?.color || 'bg-gray-100'} text-base px-3 py-1`}>
                        {actionConfig[selectedLog.action]?.icon}
                        <span className="ml-2">{actionConfig[selectedLog.action]?.label || selectedLog.action}</span>
                      </Badge>
                    </div>
                  </FormField>
                </FormGrid>
              </FormSection>

              {/* Section 2: Người thực hiện */}
              <FormSection
                title="Người thực hiện"
                description="Thông tin người dùng thực hiện thao tác"
                icon={<User size={20} />}
              >
                <FormGrid columns={2}>
                  <FormField>
                    <FormLabel>Họ tên</FormLabel>
                    <div className="h-12 px-4 flex items-center bg-gray-100 rounded-lg text-base font-medium">
                      {selectedLog.user?.fullName || 'N/A'}
                    </div>
                  </FormField>
                  <FormField>
                    <FormLabel>Module</FormLabel>
                    <div className="h-12 px-4 flex items-center bg-gray-100 rounded-lg">
                      <Badge variant="outline" className="text-base px-3 py-1">
                        {moduleLabels[selectedLog.module] || selectedLog.module}
                      </Badge>
                    </div>
                  </FormField>
                </FormGrid>

                {/* Client Info */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-3 mt-4">
                  <div className="flex items-center gap-3 text-base">
                    <Globe size={18} className="text-gray-500" />
                    <span className="text-gray-600 font-medium">Địa chỉ IP:</span>
                    <span className="font-mono">{selectedLog.ipAddress || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-3 text-base">
                    <Monitor size={18} className="text-gray-500 mt-0.5" />
                    <span className="text-gray-600 font-medium shrink-0">Thiết bị:</span>
                    <span className="text-sm text-gray-700 break-all">{selectedLog.userAgent || 'N/A'}</span>
                  </div>
                </div>
              </FormSection>

              {/* Section 3: Chi tiết thay đổi */}
              {selectedLog.action === 'update' && (
                <FormSection
                  title="Chi tiết thay đổi"
                  description={`${calculateDiff(selectedLog.oldValue, selectedLog.newValue).length} trường đã được thay đổi`}
                  icon={<Pencil size={20} />}
                >
                  {/* Legend */}
                  <div className="flex items-center gap-6 text-base mb-4">
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-red-500 rounded"></span>
                      Giá trị cũ
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-green-500 rounded"></span>
                      Giá trị mới
                    </span>
                  </div>

                  {calculateDiff(selectedLog.oldValue, selectedLog.newValue).length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead className="w-1/5 text-base font-semibold py-3">Trường</TableHead>
                            <TableHead className="w-2/5 text-base font-semibold py-3">Giá trị cũ</TableHead>
                            <TableHead className="w-2/5 text-base font-semibold py-3">Giá trị mới</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {calculateDiff(selectedLog.oldValue, selectedLog.newValue).map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-semibold text-base py-4">{item.field}</TableCell>
                              <TableCell className="bg-red-50 border-l-4 border-red-400">
                                <div className="text-base text-red-700 whitespace-pre-wrap break-all font-mono p-2">
                                  {formatValue(item.oldVal)}
                                </div>
                              </TableCell>
                              <TableCell className="bg-green-50 border-l-4 border-green-400">
                                <div className="text-base text-green-700 whitespace-pre-wrap break-all font-mono p-2">
                                  {formatValue(item.newVal)}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </FormSection>
              )}

              {/* Create View */}
              {selectedLog.action === 'create' && selectedLog.newValue && (
                <FormSection
                  title="Dữ liệu tạo mới"
                  description="Thông tin của bản ghi được tạo"
                  icon={<Plus size={20} />}
                >
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg overflow-x-auto">
                    <pre className="text-base text-green-800 whitespace-pre-wrap font-mono">
                      {JSON.stringify(selectedLog.newValue, null, 2)}
                    </pre>
                  </div>
                </FormSection>
              )}

              {/* Delete View */}
              {selectedLog.action === 'delete' && selectedLog.oldValue && (
                <FormSection
                  title="Dữ liệu đã xóa"
                  description="Thông tin của bản ghi đã bị xóa"
                  icon={<Trash2 size={20} />}
                >
                  <FormInfoBox variant="warning">
                    Bản ghi này đã bị xóa vĩnh viễn khỏi hệ thống
                  </FormInfoBox>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg overflow-x-auto mt-4">
                    <pre className="text-base text-red-800 whitespace-pre-wrap font-mono">
                      {JSON.stringify(selectedLog.oldValue, null, 2)}
                    </pre>
                  </div>
                </FormSection>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
