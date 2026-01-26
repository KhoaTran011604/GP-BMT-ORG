'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/finance/ImageUpload';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Asset {
    _id?: string;
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

interface AssetFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    asset?: Asset | null;
    onSuccess: () => void;
}

export function AssetFormDialog({ open, onOpenChange, asset, onSuccess }: AssetFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const [parishes, setParishes] = useState<any[]>([]);
    const [formData, setFormData] = useState<Asset>({
        assetCode: '',
        assetName: '',
        assetType: 'land',
        parishId: '',
        location: '',
        status: 'active',
        images: [],
    });

    useEffect(() => {
        fetchParishes();
    }, []);

    useEffect(() => {
        if (asset) {
            setFormData({
                ...asset,
                acquisitionDate: asset.acquisitionDate ? asset.acquisitionDate.split('T')[0] : '',
                images: asset.images || [],
            });
        } else {
            setFormData({
                assetCode: '',
                assetName: '',
                assetType: 'land',
                parishId: '',
                location: '',
                status: 'active',
                images: [],
            });
        }
    }, [asset, open]);

    const fetchParishes = async () => {
        try {
            const res = await fetch('/api/parishes');
            if (res.ok) {
                const data = await res.json();
                console.log('Parishes API response:', data);
                // API returns { data: [...] }
                const parishList = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
                console.log('Parsed parishes:', parishList);
                setParishes(parishList);
            } else {
                console.error('Failed to fetch parishes:', res.status, res.statusText);
            }
        } catch (error) {
            console.error('Error fetching parishes:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.assetCode || !formData.assetName || !formData.parishId || !formData.location) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setLoading(true);

        try {
            const selectedParish = parishes.find(p => p._id === formData.parishId);
            const acquisitionValue = formData.acquisitionValue ? Number(formData.acquisitionValue) : 0;

            const payload = {
                ...formData,
                parishName: selectedParish?.parishName || '',
                area: formData.area ? Number(formData.area) : 0,
                acquisitionValue: acquisitionValue,
                // For new assets, currentValue = acquisitionValue. For updates, use formData.currentValue
                currentValue: asset?._id
                    ? (formData.currentValue ? Number(formData.currentValue) : 0)
                    : acquisitionValue,
            };

            const url = asset?._id ? `/api/assets/${asset._id}` : '/api/assets';
            const method = asset?._id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error('Failed to save asset');
            }

            toast.success(asset?._id ? 'Cập nhật tài sản thành công' : 'Thêm tài sản thành công');
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error('Error saving asset:', error);
            toast.error('Lỗi khi lưu tài sản');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{asset?._id ? 'Chỉnh sửa Tài sản' : 'Thêm Tài sản mới'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="assetCode">Mã tài sản <span className="text-red-500">*</span></Label>
                            <Input
                                id="assetCode"
                                value={formData.assetCode}
                                onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                                placeholder="VD: TS-001"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="assetName">Tên tài sản <span className="text-red-500">*</span></Label>
                            <Input
                                id="assetName"
                                value={formData.assetName}
                                onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                                placeholder="VD: Nhà thờ chính"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="assetType">Loại tài sản <span className="text-red-500">*</span></Label>
                            <Select value={formData.assetType} onValueChange={(value: any) => setFormData({ ...formData, assetType: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="land">Đất đai</SelectItem>
                                    <SelectItem value="building">Nhà cửa</SelectItem>
                                    <SelectItem value="vehicle">Phương tiện</SelectItem>
                                    <SelectItem value="equipment">Thiết bị</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="parishId">Đơn vị <span className="text-red-500">*</span></Label>
                            <Select value={formData.parishId} onValueChange={(value) => setFormData({ ...formData, parishId: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn Giáo xứ" />
                                </SelectTrigger>
                                <SelectContent>
                                    {parishes.length === 0 ? (
                                        <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                                    ) : (
                                        parishes.map((p) => (
                                            <SelectItem key={p._id} value={p._id}>
                                                {p.parishName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {parishes.length > 0 && (
                                <p className="text-xs text-gray-500">Có {parishes.length} Giáo xứ</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Vị trí <span className="text-red-500">*</span></Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Địa chỉ chi tiết"
                            required
                        />
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="area">Diện tích (m²)</Label>
                            <Input
                                id="area"
                                type="number"
                                value={formData.area || ''}
                                onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                                placeholder="0"
                            />
                        </div>

                        {!asset?._id ? (
                            <div className="space-y-2">
                                <Label htmlFor="acquisitionValue">Giá trị mua (VNĐ)</Label>
                                <Input
                                    id="acquisitionValue"
                                    type="number"
                                    value={formData.acquisitionValue || ''}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        setFormData({
                                            ...formData,
                                            acquisitionValue: value,
                                            // Auto-sync currentValue when creating new asset
                                            currentValue: value
                                        });
                                    }}
                                    placeholder="0"
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="currentValue">Giá trị hiện tại (VNĐ)</Label>
                                <Input
                                    id="currentValue"
                                    type="number"
                                    value={formData.currentValue || ''}
                                    onChange={(e) => setFormData({ ...formData, currentValue: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="acquisitionDate">Ngày mua/nhận</Label>
                            <Input
                                id="acquisitionDate"
                                type="date"
                                value={formData.acquisitionDate || ''}
                                onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Trạng thái <span className="text-red-500">*</span></Label>
                            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Đang sử dụng</SelectItem>
                                    <SelectItem value="sold">Đã bán</SelectItem>
                                    <SelectItem value="disposed">Đã thanh lý</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Ghi chú</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Thông tin bổ sung..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Hình ảnh</Label>
                        <ImageUpload
                            images={formData.images || []}
                            onChange={(urls) => setFormData({ ...formData, images: urls })}
                            maxImages={5}
                            disabled={loading}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                asset?._id ? 'Cập nhật' : 'Thêm mới'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
