'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Asset {
  _id: string;
  assetCode: string;
  assetName: string;
  assetType: 'land' | 'building' | 'vehicle' | 'equipment';
  parishId: string;
  parishName?: string;
  location: string;
  area?: number;
  acquisitionDate?: string;
  acquisitionValue?: number;
  currentValue?: number;
  legalDocs?: any;
  status: 'active' | 'sold' | 'disposed';
  notes?: string;
}

const assetTypeConfig = {
  land: { label: 'Dat dai', icon: '🏞️', color: 'bg-green-100 text-green-800' },
  building: { label: 'Nha cua', icon: '🏛️', color: 'bg-blue-100 text-blue-800' },
  vehicle: { label: 'Phuong tien', icon: '🚗', color: 'bg-purple-100 text-purple-800' },
  equipment: { label: 'Thiet bi', icon: '⚙️', color: 'bg-orange-100 text-orange-800' },
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      if (res.ok) {
        const data = await res.json();
        setAssets(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const filteredAssets = assets.filter(a => {
    const matchesType = typeFilter === 'all' || a.assetType === typeFilter;
    const matchesSearch = !searchTerm ||
      a.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.parishName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalValue = assets.reduce((sum, a) => sum + (a.currentValue || 0), 0);

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
          <h1 className="text-2xl font-bold">Quan ly Tai san</h1>
          <p className="text-gray-600">Quan ly tai san cua Giao phan va cac Giao xu</p>
        </div>
        <Button>+ Them tai san</Button>
      </div>

      {/* Stats by Type */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(assetTypeConfig).map(([key, config]) => (
          <Card key={key} className="hover:shadow-md cursor-pointer" onClick={() => setTypeFilter(key)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{config.icon}</div>
                <div>
                  <div className="text-2xl font-bold">
                    {assets.filter(a => a.assetType === key).length}
                  </div>
                  <p className="text-sm text-gray-600">{config.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Tong so tai san</p>
              <p className="text-3xl font-bold text-blue-600">{assets.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tong gia tri hien tai</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">So Giao xu co tai san</p>
              <p className="text-3xl font-bold text-purple-600">
                {new Set(assets.map(a => a.parishId)).size}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sach Tai san ({filteredAssets.length})</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Tim kiem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tat ca</SelectItem>
                  <SelectItem value="land">Dat dai</SelectItem>
                  <SelectItem value="building">Nha cua</SelectItem>
                  <SelectItem value="vehicle">Phuong tien</SelectItem>
                  <SelectItem value="equipment">Thiet bi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">📦</p>
              <p>Chua co tai san nao</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ma TS</TableHead>
                  <TableHead>Ten tai san</TableHead>
                  <TableHead>Loai</TableHead>
                  <TableHead>Don vi</TableHead>
                  <TableHead>Vi tri</TableHead>
                  <TableHead>Dien tich</TableHead>
                  <TableHead className="text-right">Gia tri</TableHead>
                  <TableHead>Trang thai</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="font-mono">{a.assetCode}</TableCell>
                    <TableCell className="font-medium">{a.assetName}</TableCell>
                    <TableCell>
                      <Badge className={assetTypeConfig[a.assetType].color}>
                        {assetTypeConfig[a.assetType].icon} {assetTypeConfig[a.assetType].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{a.parishName || 'TGM'}</TableCell>
                    <TableCell className="max-w-xs truncate">{a.location}</TableCell>
                    <TableCell>{a.area ? `${a.area} m²` : '-'}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(a.currentValue)}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        a.status === 'active' ? 'bg-green-100 text-green-800' :
                        a.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {a.status === 'active' ? 'Dang su dung' :
                         a.status === 'sold' ? 'Da ban' : 'Da thanh ly'}
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
