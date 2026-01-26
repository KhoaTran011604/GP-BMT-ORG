'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Edit, Trash2, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface Project {
    _id: string;
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

interface ProjectDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: Project | null;
    onEdit: () => void;
    onDelete: () => void;
}

const statusConfig = {
    planning: { label: 'Đang lập kế hoạch', color: 'bg-gray-100 text-gray-800' },
    in_progress: { label: 'Đang thi công', color: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

const permitConfig = {
    pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'Đã có phép', color: 'bg-green-100 text-green-800' },
    rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
};

export function ProjectDetailModal({ open, onOpenChange, project, onEdit, onDelete }: ProjectDetailModalProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!project) return null;

    const formatCurrency = (amount: number) => {
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
                                <DialogTitle className="text-2xl">{project.projectName}</DialogTitle>
                                <p className="text-sm text-gray-500 mt-1">{project.parishName}</p>
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
                        {project.images && project.images.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold">Hình ảnh dự án</h3>
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                    {project.images.map((url, index) => (
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

                        {/* Status & Progress */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-3">Trạng thái</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Loại dự án</p>
                                        <Badge variant="outline">
                                            {project.projectType === 'construction' ? '🏗️ Xây mới' : '🔧 Sửa chữa'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Trạng thái dự án</p>
                                        <Badge className={statusConfig[project.status].color}>
                                            {statusConfig[project.status].label}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Phép xây dựng</p>
                                        <Badge className={permitConfig[project.permitStatus].color}>
                                            {permitConfig[project.permitStatus].label}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">Tiến độ</h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-500">Hoàn thành</span>
                                            <span className="text-2xl font-bold text-blue-600">{project.progress}%</span>
                                        </div>
                                        <Progress value={project.progress} className="h-3" />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>
                                            {project.status === 'completed' ? 'Dự án đã hoàn thành' :
                                                project.status === 'in_progress' ? 'Đang trong quá trình thi công' :
                                                    project.status === 'planning' ? 'Đang lập kế hoạch' :
                                                        'Dự án đã bị hủy'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Financial Info */}
                        <div>
                            <h3 className="font-semibold mb-3">Thông tin tài chính</h3>
                            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                    <p className="text-sm text-gray-600">Ngân sách dự án</p>
                                </div>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(project.budget)}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Timeline */}
                        <div>
                            <h3 className="font-semibold mb-3">Thời gian thực hiện</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                        <p className="text-sm text-gray-600">Ngày khởi công</p>
                                    </div>
                                    <p className="font-semibold text-blue-600">{formatDate(project.startDate)}</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-purple-600" />
                                        <p className="text-sm text-gray-600">Dự kiến hoàn thành</p>
                                    </div>
                                    <p className="font-semibold text-purple-600">{formatDate(project.expectedEnd)}</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-green-600" />
                                        <p className="text-sm text-gray-600">Thực tế hoàn thành</p>
                                    </div>
                                    <p className="font-semibold text-green-600">{formatDate(project.actualEnd)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {project.description && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="font-semibold mb-2">Mô tả dự án</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
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
