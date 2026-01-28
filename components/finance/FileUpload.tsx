'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, FileText, Image as ImageIcon, Eye, Download } from 'lucide-react';

export type FileType = 'image' | 'document' | 'all';

interface UploadedFile {
  url: string;
  type: 'image' | 'document';
  name?: string;
}

interface FileUploadProps {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  fileType?: FileType; // 'image' | 'document' | 'all'
}

// Helper to get accept string based on fileType
const getAcceptString = (fileType: FileType): string => {
  switch (fileType) {
    case 'image':
      return 'image/*';
    case 'document':
      return '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'all':
    default:
      return 'image/*,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
};

// Helper to determine file type from mime type or extension
const getFileTypeFromFile = (file: File): 'image' | 'document' => {
  if (file.type.startsWith('image/')) return 'image';
  return 'document';
};

// Helper to determine file type from URL
const getFileTypeFromUrl = (url: string): 'image' | 'document' => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i)) return 'image';
  if (lowerUrl.match(/\.(pdf|doc|docx)(\?|$)/i)) return 'document';
  // Default to image for Cloudinary URLs without clear extension
  return 'image';
};

// Helper to get file extension
const getFileExtension = (url: string): string => {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? match[1].toUpperCase() : 'FILE';
};

export function FileUpload({
  files,
  onChange,
  maxFiles = 5,
  disabled = false,
  fileType = 'all'
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Tối đa ${maxFiles} tệp`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('files', file));
    formData.append('allowDocuments', 'true');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { urls } = await response.json();
        const newFiles: UploadedFile[] = urls.map((url: string, index: number) => ({
          url,
          type: getFileTypeFromFile(selectedFiles[index]),
          name: selectedFiles[index].name
        }));
        onChange([...files, ...newFiles]);
        setUploadProgress(100);
      } else {
        const error = await response.json();
        alert(`Upload thất bại: ${error.error || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const openFile = (file: UploadedFile) => {
    window.open(file.url, '_blank');
  };

  const downloadFile = (file: UploadedFile) => {
    const fileName = file.name || `file-${Date.now()}`;

    // Use download proxy API to avoid CORS issues
    const downloadUrl = `/api/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(fileName)}`;
    window.open(downloadUrl, '_blank');
  };

  const getUploadLabel = () => {
    switch (fileType) {
      case 'image':
        return 'Tải lên hình ảnh';
      case 'document':
        return 'Tải lên tài liệu';
      default:
        return 'Tải lên tệp';
    }
  };

  return (
    <div className="space-y-4">
      {files.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              {file.type === 'image' ? (
                <div className="relative w-24 h-24">
                  <img
                    src={file.url}
                    alt={file.name || `Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 rounded">
                    <button
                      type="button"
                      onClick={() => openFile(file)}
                      className="p-1 bg-white/90 rounded hover:bg-white"
                      title="Xem"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadFile(file)}
                      className="p-1 bg-white/90 rounded hover:bg-white"
                      title="Tải xuống"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative w-24 h-24 border border-gray-200 rounded bg-gray-50 flex flex-col items-center justify-center p-2">
                  <FileText size={24} className="text-red-500 mb-1" />
                  <span className="text-xs text-gray-600 text-center truncate w-full">
                    {getFileExtension(file.url)}
                  </span>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 rounded">
                    <button
                      type="button"
                      onClick={() => openFile(file)}
                      className="p-1 bg-white/90 rounded hover:bg-white"
                      title="Xem"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadFile(file)}
                      className="p-1 bg-white/90 rounded hover:bg-white"
                      title="Tải xuống"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Xóa tệp"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {files.length < maxFiles && !disabled && (
        <>
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById('file-upload-input')?.click()}
            className="w-full sm:w-auto"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={16} />
                Đang tải... {uploadProgress > 0 && `${uploadProgress}%`}
              </>
            ) : (
              <>
                <Upload className="mr-2" size={16} />
                {getUploadLabel()} ({files.length}/{maxFiles})
              </>
            )}
          </Button>

          <input
            id="file-upload-input"
            type="file"
            accept={getAcceptString(fileType)}
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </>
      )}

      {files.length === 0 && (
        <p className="text-sm text-gray-500">
          Chưa có tệp nào. Bạn có thể tải lên tối đa {maxFiles} tệp.
          {fileType === 'all' && <span className="block text-xs mt-1">Hỗ trợ: Hình ảnh, DOC, DOCX</span>}
          {fileType === 'document' && <span className="block text-xs mt-1">Hỗ trợ: DOC, DOCX</span>}
        </p>
      )}
    </div>
  );
}

// Backward compatibility: export as ImageUpload with legacy interface
interface LegacyImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUpload({ images, onChange, maxImages = 5, disabled = false }: LegacyImageUploadProps) {
  // Convert legacy string[] to UploadedFile[]
  const files: UploadedFile[] = images.map(url => ({
    url,
    type: getFileTypeFromUrl(url)
  }));

  const handleChange = (newFiles: UploadedFile[]) => {
    onChange(newFiles.map(f => f.url));
  };

  return (
    <FileUpload
      files={files}
      onChange={handleChange}
      maxFiles={maxImages}
      disabled={disabled}
      fileType="image"
    />
  );
}
