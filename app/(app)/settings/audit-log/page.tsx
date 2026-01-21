'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AuditLog {
  _id: string;
  userId: string;
  userName?: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'login' | 'logout';
  module: string;
  recordId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

const actionConfig = {
  create: { label: 'Tao moi', color: 'bg-green-100 text-green-800' },
  update: { label: 'Cap nhat', color: 'bg-blue-100 text-blue-800' },
  delete: { label: 'Xoa', color: 'bg-red-100 text-red-800' },
  approve: { label: 'Phe duyet', color: 'bg-purple-100 text-purple-800' },
  reject: { label: 'Tu choi', color: 'bg-orange-100 text-orange-800' },
  login: { label: 'Dang nhap', color: 'bg-cyan-100 text-cyan-800' },
  logout: { label: 'Dang xuat', color: 'bg-gray-100 text-gray-800' },
};

const moduleLabels: Record<string, string> = {
  parish: 'Giao xu',
  people: 'Giao dan',
  finance: 'Tai chinh',
  hr: 'Nhan su',
  clergy: 'Linh muc',
  sacraments: 'Bi tich',
  auth: 'Xac thuc',
  settings: 'Cai dat',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  const filteredLogs = logs.filter(l => {
    const matchesAction = actionFilter === 'all' || l.action === actionFilter;
    const matchesModule = moduleFilter === 'all' || l.module === moduleFilter;
    const matchesSearch = !searchTerm ||
      l.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.module.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesModule && matchesSearch;
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
          <h1 className="text-2xl font-bold">Nhat ky He thong</h1>
          <p className="text-gray-600">Theo doi moi hoat dong trong he thong</p>
        </div>
        <Button variant="outline">Xuat bao cao</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{logs.length}</div>
            <p className="text-sm text-gray-600">Tong su kien</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {logs.filter(l => l.action === 'create').length}
            </div>
            <p className="text-sm text-gray-600">Tao moi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {logs.filter(l => l.action === 'update').length}
            </div>
            <p className="text-sm text-gray-600">Cap nhat</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {logs.filter(l => l.action === 'delete').length}
            </div>
            <p className="text-sm text-gray-600">Xoa</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hoat dong theo Module</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(moduleLabels).map(([key, label]) => {
                const count = logs.filter(l => l.module === key).length;
                const percentage = logs.length > 0 ? (count / logs.length) * 100 : 0;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-20 text-sm">{label}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-sm text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hoat dong theo Hanh dong</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(actionConfig).map(([key, config]) => {
                const count = logs.filter(l => l.action === key).length;
                return (
                  <div key={key} className="flex items-center justify-between">
                    <Badge className={config.color}>{config.label}</Badge>
                    <span className="font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Chi tiet Nhat ky ({filteredLogs.length})</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Tim kiem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
              />
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Hanh dong" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tat ca</SelectItem>
                  {Object.entries(actionConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tat ca</SelectItem>
                  {Object.entries(moduleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">📋</p>
              <p>Chua co nhat ky nao</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thoi gian</TableHead>
                  <TableHead>Nguoi dung</TableHead>
                  <TableHead>Hanh dong</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="text-sm">{formatDate(log.createdAt)}</TableCell>
                    <TableCell className="font-medium">{log.userName || '-'}</TableCell>
                    <TableCell>
                      <Badge className={actionConfig[log.action]?.color}>
                        {actionConfig[log.action]?.label || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{moduleLabels[log.module] || log.module}</TableCell>
                    <TableCell className="text-sm font-mono">{log.ipAddress || '-'}</TableCell>
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
