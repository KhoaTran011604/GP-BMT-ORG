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
import { useAuth } from '@/lib/auth-context';

interface Project {
    _id?: string;
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

interface ProjectFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project?: Project | null;
    onSuccess: () => void;
}

export function ProjectFormDialog({ open, onOpenChange, project, onSuccess }: ProjectFormDialogProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [parishes, setParishes] = useState<any[]>([]);
    const [formData, setFormData] = useState<Project>({
        projectName: '',
        parishId: '',
        projectType: 'construction',
        budget: 0,
        permitStatus: 'pending',
        progress: 0,
        status: 'planning',
        images: [],
    });

    // Set default parishId from user when component mounts
    useEffect(() => {
        if (user?.parishId && !project) {
            setFormData(prev => ({ ...prev, parishId: user.parishId! }));
        }
    }, [user?.parishId, project]);

    useEffect(() => {
        fetchParishes();
    }, []);

    useEffect(() => {
        if (project) {
            setFormData({
                ...project,
                startDate: project.startDate ? project.startDate.split('T')[0] : '',
                expectedEnd: project.expectedEnd ? project.expectedEnd.split('T')[0] : '',
                actualEnd: project.actualEnd ? project.actualEnd.split('T')[0] : '',
                images: project.images || [],
            });
        } else {
            setFormData({
                projectName: '',
                parishId: user?.parishId || '',
                projectType: 'construction',
                budget: 0,
                permitStatus: 'pending',
                progress: 0,
                status: 'planning',
                images: [],
            });
        }
    }, [project, open, user?.parishId]);

    const fetchParishes = async () => {
        try {
            const res = await fetch('/api/parishes');
            if (res.ok) {
                const data = await res.json();
                setParishes(Array.isArray(data.data) ? data.data : []);
            }
        } catch (error) {
            console.error('Error fetching parishes:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.projectName || !formData.parishId) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setLoading(true);

        try {
            const selectedParish = parishes.find(p => p._id === formData.parishId);
            const payload = {
                ...formData,
                parishName: selectedParish?.parishName || '',
                budget: Number(formData.budget),
            };

            const url = project?._id ? `/api/projects/${project._id}` : '/api/projects';
            const method = project?._id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error('Failed to save project');
            }

            toast.success(project?._id ? 'Cập nhật dự án thành công' : 'Thêm dự án thành công');
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error('Error saving project:', error);
            toast.error('Lỗi khi lưu dự án');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{project?._id ? 'Chỉnh sửa Dự án' : 'Thêm Dự án mới'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="projectName">Tên dự án <span className="text-red-500">*</span></Label>
                            <Input
                                id="projectName"
                                value={formData.projectName}
                                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                                placeholder="VD: Xây dựng nhà thờ mới"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="parishId">Giáo xứ <span className="text-red-500">*</span></Label>
                            <Select value={formData.parishId} onValueChange={(value) => setFormData({ ...formData, parishId: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn Giáo xứ" />
                                </SelectTrigger>
                                <SelectContent>
                                    {parishes.map((p) => (
                                        <SelectItem key={p._id} value={p._id}>
                                            {p.parishName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="projectType">Loại dự án <span className="text-red-500">*</span></Label>
                            <Select value={formData.projectType} onValueChange={(value: any) => setFormData({ ...formData, projectType: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="construction">Xây mới</SelectItem>
                                    <SelectItem value="renovation">Sửa chữa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Mô tả chi tiết về dự án..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="budget">Ngân sách (VNĐ) <span className="text-red-500">*</span></Label>
                            <Input
                                id="budget"
                                type="number"
                                value={formData.budget || ''}
                                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                                placeholder="0"
                                required
                            />
                        </div>

                        {project?._id && (
                            <div className="space-y-2">
                                <Label htmlFor="progress">Tiến độ (%)</Label>
                                <Input
                                    id="progress"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.progress}
                                    onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Ngày khởi công</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate || ''}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expectedEnd">Dự kiến hoàn thành</Label>
                            <Input
                                id="expectedEnd"
                                type="date"
                                value={formData.expectedEnd || ''}
                                onChange={(e) => setFormData({ ...formData, expectedEnd: e.target.value })}
                            />
                        </div>

                        {project?._id && (
                            <div className="space-y-2">
                                <Label htmlFor="actualEnd">Thực tế hoàn thành</Label>
                                <Input
                                    id="actualEnd"
                                    type="date"
                                    value={formData.actualEnd || ''}
                                    onChange={(e) => setFormData({ ...formData, actualEnd: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="permitStatus">Phép xây dựng <span className="text-red-500">*</span></Label>
                            <Select value={formData.permitStatus} onValueChange={(value: any) => setFormData({ ...formData, permitStatus: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                                    <SelectItem value="approved">Đã có phép</SelectItem>
                                    <SelectItem value="rejected">Từ chối</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Trạng thái <span className="text-red-500">*</span></Label>
                            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planning">Đang lập kế hoạch</SelectItem>
                                    <SelectItem value="in_progress">Đang thi công</SelectItem>
                                    <SelectItem value="completed">Hoàn thành</SelectItem>
                                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
                                project?._id ? 'Cập nhật' : 'Thêm mới'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
