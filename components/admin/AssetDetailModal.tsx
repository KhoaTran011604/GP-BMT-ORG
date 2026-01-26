'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useState } from 'react';

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
    status: 'active' | 'sold' | 'disposed';
    notes?: string;
    images?: string[];
}

interface AssetDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    asset: Asset | null;
    onEdit: () => void;
    onDelete: () => void;
}

const assetTypeConfig = {
    land: { label: 'Đất đai', icon: '🏞️', color: 'bg-green-100 text-green-800' },
    building: { label: 'Nhà cửa', icon: '🏛️', color: 'bg-blue-100 text-blue-800' },
    vehicle: { label: 'Phương tiện', icon: '🚗', color: 'bg-purple-100 text-purple-800' },
    equipment: { label: 'Thiết bị', icon: '⚙️', color: 'bg-orange-100 text-orange-800' },
};

export function AssetDetailModal({ open, onOpenChange, asset, onEdit, onDelete }: AssetDetailModalProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!asset) return null;

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

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <DialogTitle className="text-2xl">{asset.assetName}</DialogTitle>
                                <p className="text-sm text-gray-500 mt-1">Mã: {asset.assetCode}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={onEdit}>
                                    <Edit className="w-4 h-4 mr-1" />
                                    Sửa
                                </Button>
                                <Button variant="destructive" size="sm" onClick={onDelete}>
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Xóa
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Images Gallery */}
                        {asset.images && asset.images.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold">Hình ảnh</h3>
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                    {asset.images.map((url, index) => (
                                        <div
                                            key={index}
                                            className="aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => setSelectedImage(url)}
                                        >
                                            <img
                                                src={url}
                                                alt={`Ảnh ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-3">Thông tin cơ bản</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Loại tài sản</p>
                                        <Badge className={assetTypeConfig[asset.assetType].color}>
                                            {assetTypeConfig[asset.assetType].icon} {assetTypeConfig[asset.assetType].label}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Đơn vị quản lý</p>
                                        <p className="font-medium">{asset.parishName || 'TGM'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Trạng thái</p>
                                        <Badge className={
                                            asset.status === 'active' ? 'bg-green-100 text-green-800' :
                                                asset.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }>
                                            {asset.status === 'active' ? 'Đang sử dụng' :
                                                asset.status === 'sold' ? 'Đã bán' : 'Đã thanh lý'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">Vị trí & Diện tích</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 mt-1 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Địa chỉ</p>
                                            <p className="font-medium">{asset.location}</p>
                                        </div>
                                    </div>
                                    {asset.area && (
                                        <div>
                                            <p className="text-sm text-gray-500">Diện tích</p>
                                            <p className="font-medium">{asset.area} m²</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Financial Info */}
                        <div>
                            <h3 className="font-semibold mb-3">Thông tin tài chính</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="w-4 h-4 text-blue-600" />
                                        <p className="text-sm text-gray-600">Giá trị mua</p>
                                    </div>
                                    <p className="text-lg font-bold text-blue-600">{formatCurrency(asset.acquisitionValue)}</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        <p className="text-sm text-gray-600">Giá trị hiện tại</p>
                                    </div>
                                    <p className="text-lg font-bold text-green-600">{formatCurrency(asset.currentValue)}</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-purple-600" />
                                        <p className="text-sm text-gray-600">Ngày mua/nhận</p>
                                    </div>
                                    <p className="text-lg font-bold text-purple-600">{formatDate(asset.acquisitionDate)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {asset.notes && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="font-semibold mb-2">Ghi chú</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{asset.notes}</p>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Image Lightbox */}
            {selectedImage && (
                <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                    <DialogContent className="max-w-5xl">
                        <img
                            src={selectedImage}
                            alt="Xem ảnh"
                            className="w-full h-auto max-h-[80vh] object-contain"
                        />
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
