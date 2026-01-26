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
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Eye,
  ArrowRight,
  Monitor,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="text-blue-600" />
            Nhật ký hệ thống
          </h1>
          <p className="text-gray-600">Theo dõi tất cả hoạt động trong hệ thống</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(actionConfig).map(([key, config]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  {config.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{config.label}</p>
                  <p className="text-xl font-bold">
                    {logs.filter(l => l.action === key).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Module</Label>
              <Select
                value={filters.module}
                onValueChange={(value) => {
                  setFilters({ ...filters, module: value });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(moduleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hành động</Label>
              <Select
                value={filters.action}
                onValueChange={(value) => {
                  setFilters({ ...filters, action: value });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(actionConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Từ ngày</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setFilters({ ...filters, startDate: e.target.value });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Đến ngày</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setFilters({ ...filters, endDate: e.target.value });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                className="w-full"
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

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách nhật ký ({pagination.total})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <History className="mx-auto mb-4 text-gray-300" size={48} />
              <p>Chưa có nhật ký nào</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Người thực hiện</TableHead>
                    <TableHead>Hành động</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead className="text-right">Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="text-sm">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                              {log.user ? getInitials(log.user.fullName) : '??'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{log.user?.fullName || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{log.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${actionConfig[log.action]?.color || 'bg-gray-100'} flex items-center gap-1 w-fit`}>
                          {actionConfig[log.action]?.icon}
                          {actionConfig[log.action]?.label || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {moduleLabels[log.module] || log.module}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {log.ipAddress || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailDialog(log)}
                        >
                          <Eye size={16} className="mr-1" />
                          Xem
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft size={16} />
                    Trước
                  </Button>
                  <span className="text-sm">
                    Trang {pagination.page} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Sau
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-[90vw]! w-[90vw]! max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <History size={24} />
              Chi tiết nhật ký
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6">
              {/* Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-gray-500">Thời gian</Label>
                  <p className="font-medium">{formatDate(selectedLog.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500">Người thực hiện</Label>
                  <p className="font-medium">{selectedLog.user?.fullName || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500">Hành động</Label>
                  <Badge className={actionConfig[selectedLog.action]?.color || 'bg-gray-100'}>
                    {actionConfig[selectedLog.action]?.label || selectedLog.action}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500">Module</Label>
                  <Badge variant="outline">
                    {moduleLabels[selectedLog.module] || selectedLog.module}
                  </Badge>
                </div>
              </div>

              {/* Client Info */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Globe size={14} className="text-gray-400" />
                  <span className="text-gray-500">IP:</span>
                  <span>{selectedLog.ipAddress || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Monitor size={14} className="text-gray-400" />
                  <span className="text-gray-500">User Agent:</span>
                  <span className="truncate">{selectedLog.userAgent || 'N/A'}</span>
                </div>
              </div>

              {/* Diff View - Git Style */}
              {selectedLog.action === 'update' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Pencil size={16} />
                      Thay đổi ({calculateDiff(selectedLog.oldValue, selectedLog.newValue).length} trường )
                    </h4>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-red-500 rounded"></span>
                        Đã xóa
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-green-500 rounded"></span>
                        Đã thêm
                      </span>
                    </div>
                  </div>

                  

                  {/* Summary table */}
                  {calculateDiff(selectedLog.oldValue, selectedLog.newValue).length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 font-medium text-sm border-b">
                        Chi tiết thay đổi
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-1/5">Trường</TableHead>
                            <TableHead className="w-2/5">Giá trị cũ</TableHead>
                            <TableHead className="w-2/5">Giá trị mới</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {calculateDiff(selectedLog.oldValue, selectedLog.newValue).map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium text-sm">{item.field}</TableCell>
                              <TableCell className="bg-red-50 border-l-4 border-red-400">
                                <div className="text-sm text-red-700 whitespace-pre-wrap break-all font-sans">
                                  {formatValue(item.oldVal)}
                                </div>
                              </TableCell>
                              <TableCell className="bg-green-50 border-l-4 border-green-400">
                                <div className="text-sm text-green-700 whitespace-pre-wrap break-all font-sans">
                                  {formatValue(item.newVal)}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {/* Create View */}
              {selectedLog.action === 'create' && selectedLog.newValue && (
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Plus size={16} />
                    Dữ liệu tạo mới
                  </h4>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg overflow-x-auto">
                    <div className="text-sm text-green-800 whitespace-pre-wrap font-sans">
                      {JSON.stringify(selectedLog.newValue, null, 2)}
                    </div>
                  </div>
                </div>
              )}

              {/* Delete View */}
              {selectedLog.action === 'delete' && selectedLog.oldValue && (
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Trash2 size={16} />
                    Dữ liệu đã xóa
                  </h4>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg overflow-x-auto">
                    <div className="text-sm text-red-800 whitespace-pre-wrap font-sans">
                      {JSON.stringify(selectedLog.oldValue, null, 2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
