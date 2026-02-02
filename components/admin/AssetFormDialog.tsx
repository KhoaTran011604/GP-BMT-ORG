'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormSection, FormField, FormLabel, FormGrid } from '@/components/ui/form-section';
import { ImageUpload } from '@/components/finance/ImageUpload';
import { toast } from 'sonner';
import { Loader2, Package, MapPin, Wallet, FileText, ImageIcon } from 'lucide-react';

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
                    <DialogTitle className="text-xl">{asset?._id ? 'Chỉnh sửa Tài sản' : 'Thêm Tài sản mới'}</DialogTitle>
                    <DialogDescription className="text-base">
                        {asset?._id ? 'Cập nhật thông tin tài sản' : 'Điền đầy đủ thông tin tài sản mới'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Thông tin cơ bản */}
                    <FormSection title="Thông tin cơ bản" icon={<Package size={18} />}>
                        <FormGrid>
                            <FormField>
                                <FormLabel required>Mã tài sản</FormLabel>
                                <Input
                                    value={formData.assetCode}
                                    onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                                    placeholder="VD: TS-001"
                                    required
                                    className="h-12 text-base"
                                />
                            </FormField>

                            <FormField>
                                <FormLabel required>Tên tài sản</FormLabel>
                                <Input
                                    value={formData.assetName}
                                    onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                                    placeholder="VD: Nhà thờ chính"
                                    required
                                    className="h-12 text-base"
                                />
                            </FormField>

                            <FormField>
                                <FormLabel required>Loại tài sản</FormLabel>
                                <Select value={formData.assetType} onValueChange={(value: any) => setFormData({ ...formData, assetType: value })}>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="land" className="text-base py-3">🏞️ Đất đai</SelectItem>
                                        <SelectItem value="building" className="text-base py-3">🏛️ Nhà cửa</SelectItem>
                                        <SelectItem value="vehicle" className="text-base py-3">🚗 Phương tiện</SelectItem>
                                        <SelectItem value="equipment" className="text-base py-3">⚙️ Thiết bị</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField>
                                <FormLabel required>Đơn vị (Giáo xứ)</FormLabel>
                                <Select value={formData.parishId} onValueChange={(value) => setFormData({ ...formData, parishId: value })}>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="Chọn Giáo xứ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parishes.length === 0 ? (
                                            <SelectItem value="loading" disabled className="text-base py-3">Đang tải...</SelectItem>
                                        ) : (
                                            parishes.map((p) => (
                                                <SelectItem key={p._id} value={p._id} className="text-base py-3">
                                                    {p.parishName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {parishes.length > 0 && (
                                    <p className="text-sm text-gray-500 mt-1">Có {parishes.length} Giáo xứ</p>
                                )}
                            </FormField>
                        </FormGrid>
                    </FormSection>

                    {/* Thông tin vị trí */}
                    <FormSection title="Thông tin vị trí" icon={<MapPin size={18} />}>
                        <FormGrid>
                            <FormField className="col-span-2">
                                <FormLabel required>Vị trí / Địa chỉ</FormLabel>
                                <Input
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Địa chỉ chi tiết của tài sản"
                                    required
                                    className="h-12 text-base"
                                />
                            </FormField>

                            <FormField>
                                <FormLabel>Diện tích (m²)</FormLabel>
                                <Input
                                    type="number"
                                    value={formData.area || ''}
                                    onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                                    placeholder="0"
                                    className="h-12 text-base"
                                />
                            </FormField>
                        </FormGrid>
                    </FormSection>

                    {/* Thông tin giá trị */}
                    <FormSection title="Thông tin giá trị" icon={<Wallet size={18} />}>
                        <FormGrid>
                            <FormField>
                                <FormLabel>Ngày mua/nhận</FormLabel>
                                <Input
                                    type="date"
                                    value={formData.acquisitionDate || ''}
                                    onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                                    className="h-12 text-base"
                                />
                            </FormField>

                            {!asset?._id ? (
                                <FormField>
                                    <FormLabel>Giá trị mua (VNĐ)</FormLabel>
                                    <Input
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
                                        className="h-12 text-base"
                                    />
                                </FormField>
                            ) : (
                                <FormField>
                                    <FormLabel>Giá trị hiện tại (VNĐ)</FormLabel>
                                    <Input
                                        type="number"
                                        value={formData.currentValue || ''}
                                        onChange={(e) => setFormData({ ...formData, currentValue: Number(e.target.value) })}
                                        placeholder="0"
                                        className="h-12 text-base"
                                    />
                                </FormField>
                            )}

                            <FormField>
                                <FormLabel required>Trạng thái</FormLabel>
                                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active" className="text-base py-3">✅ Đang sử dụng</SelectItem>
                                        <SelectItem value="sold" className="text-base py-3">💰 Đã bán</SelectItem>
                                        <SelectItem value="disposed" className="text-base py-3">🗑️ Đã thanh lý</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </FormGrid>
                    </FormSection>

                    {/* Thông tin bổ sung */}
                    <FormSection title="Thông tin bổ sung" icon={<FileText size={18} />}>
                        <FormField>
                            <FormLabel>Ghi chú</FormLabel>
                            <Textarea
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Thông tin bổ sung về tài sản..."
                                rows={3}
                                className="text-base"
                            />
                        </FormField>
                    </FormSection>

                    {/* Hình ảnh */}
                    <FormSection title="Hình ảnh tài sản" icon={<ImageIcon size={18} />}>
                        <FormField>
                            <FormLabel>Tải lên hình ảnh (tối đa 5 ảnh)</FormLabel>
                            <ImageUpload
                                images={formData.images || []}
                                onChange={(urls) => setFormData({ ...formData, images: urls })}
                                maxImages={5}
                                disabled={loading}
                            />
                        </FormField>
                    </FormSection>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="h-12 px-8 text-base sm:w-auto w-full">
                            Hủy bỏ
                        </Button>
                        <Button type="submit" disabled={loading} className="h-12 px-8 text-base sm:w-auto w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
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
