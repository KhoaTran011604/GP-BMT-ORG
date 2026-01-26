'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssetFormDialog } from '@/components/admin/AssetFormDialog';
import { AssetDetailModal } from '@/components/admin/AssetDetailModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Edit, Trash2 } from 'lucide-react';

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
  images?: string[];
}

const assetTypeConfig = {
  land: { label: 'Đất đai', icon: '🏞️', color: 'bg-green-100 text-green-800' },
  building: { label: 'Nhà cửa', icon: '🏛️', color: 'bg-blue-100 text-blue-800' },
  vehicle: { label: 'Phương tiện', icon: '🚗', color: 'bg-purple-100 text-purple-800' },
  equipment: { label: 'Thiết bị', icon: '⚙️', color: 'bg-orange-100 text-orange-800' },
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

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
      toast.error('Lỗi khi tải danh sách tài sản');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedAsset(null);
    setFormOpen(true);
  };

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormOpen(true);
    setDetailOpen(false);
  };

  const handleViewDetail = (asset: Asset) => {
    setSelectedAsset(asset);
    setDetailOpen(true);
  };

  const handleDeleteClick = (asset: Asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
    setDetailOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;

    try {
      const res = await fetch(`/api/assets/${assetToDelete._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('Xóa tài sản thành công');
      fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Lỗi khi xóa tài sản');
    } finally {
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
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
          <h1 className="text-2xl font-bold">Quản lý Tài sản</h1>
          <p className="text-gray-600">Quản lý tài sản của Giáo phận và các Giáo xứ</p>
        </div>
        <Button onClick={handleCreate}>+ Thêm tài sản</Button>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Tổng số tài sản</p>
              <p className="text-3xl font-bold text-blue-600">{assets.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng giá trị hiện tại</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số Giáo xứ có tài sản</p>
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
            <CardTitle>Danh sách Tài sản ({filteredAssets.length})</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="land">Đất đai</SelectItem>
                  <SelectItem value="building">Nhà cửa</SelectItem>
                  <SelectItem value="vehicle">Phương tiện</SelectItem>
                  <SelectItem value="equipment">Thiết bị</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">📦</p>
              <p>Chưa có tài sản nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã TS</TableHead>
                  <TableHead>Tên tài sản</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Diện tích</TableHead>
                  <TableHead className="text-right">Giá trị</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
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
                        {a.status === 'active' ? 'Đang sử dụng' :
                          a.status === 'sold' ? 'Đã bán' : 'Đã thanh lý'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(a)}>
                          Chi tiết
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(a)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(a)}>
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
      <AssetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        asset={selectedAsset}
        onSuccess={fetchAssets}
      />

      <AssetDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        asset={selectedAsset}
        onEdit={() => handleEdit(selectedAsset!)}
        onDelete={() => handleDeleteClick(selectedAsset!)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài sản <strong>{assetToDelete?.assetName}</strong>?
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
