'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Clergy {
  _id: string;
  saintName: string;
  fullName: string;
  dob: string;
  birthplace: string;
  ordinationDate: string;
  trainingClass: string;
  currentAssignment?: string;
  parishName?: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  status: 'active' | 'retired' | 'deceased';
}

export default function ClergyDirectoryPage() {
  const [clergy, setClergy] = useState<Clergy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchClergy();
  }, []);

  const fetchClergy = async () => {
    try {
      const res = await fetch('/api/clergy');
      if (res.ok) {
        const data = await res.json();
        setClergy(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching clergy:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const filteredClergy = clergy.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch = !searchTerm ||
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.saintName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.parishName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
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
          <h1 className="text-2xl font-bold">Danh ba Linh muc</h1>
          <p className="text-gray-600">Danh sach Linh muc doan Giao phan Buon Ma Thuot</p>
        </div>
        <Button>+ Them Linh muc</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{clergy.length}</div>
            <p className="text-sm text-gray-600">Tong so Linh muc</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {clergy.filter(c => c.status === 'active').length}
            </div>
            <p className="text-sm text-gray-600">Dang phuc vu</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {clergy.filter(c => c.status === 'retired').length}
            </div>
            <p className="text-sm text-gray-600">Huu duong</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(clergy.map(c => c.trainingClass)).size}
            </div>
            <p className="text-sm text-gray-600">Khoa/Lop</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tim kiem theo ten, giao xu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tat ca</SelectItem>
                <SelectItem value="active">Dang phuc vu</SelectItem>
                <SelectItem value="retired">Huu duong</SelectItem>
                <SelectItem value="deceased">Da qua doi</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clergy Grid/List */}
      {filteredClergy.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <p className="text-4xl mb-4">⛪</p>
            <p>Khong tim thay Linh muc nao</p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClergy.map((c) => (
            <Card key={c._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-20 h-20 mb-3">
                    <AvatarImage src={c.photoUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                      {getInitials(c.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{c.saintName} {c.fullName}</h3>
                  <p className="text-sm text-gray-600 mb-2">{c.parishName || 'Chua bo nhiem'}</p>
                  <Badge className={
                    c.status === 'active' ? 'bg-green-100 text-green-800' :
                    c.status === 'retired' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {c.status === 'active' ? 'Dang phuc vu' :
                     c.status === 'retired' ? 'Huu duong' : 'Da qua doi'}
                  </Badge>
                  <div className="mt-3 text-xs text-gray-500">
                    <p>Thu phong: {formatDate(c.ordinationDate)}</p>
                    <p>Lop: {c.trainingClass}</p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    Xem chi tiet
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredClergy.map((c) => (
                <div key={c._id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={c.photoUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(c.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{c.saintName} {c.fullName}</h3>
                    <p className="text-sm text-gray-600">{c.parishName || 'Chua bo nhiem'}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Lop {c.trainingClass}</p>
                    <p>Thu phong: {formatDate(c.ordinationDate)}</p>
                  </div>
                  <Badge className={
                    c.status === 'active' ? 'bg-green-100 text-green-800' :
                    c.status === 'retired' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {c.status === 'active' ? 'Dang phuc vu' :
                     c.status === 'retired' ? 'Huu duong' : 'Da qua doi'}
                  </Badge>
                  <Button variant="ghost" size="sm">Chi tiet</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
