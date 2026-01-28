'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, FileText, ExternalLink } from 'lucide-react';

interface GalleryFile {
  url: string;
  type?: 'image' | 'document';
  name?: string;
}

interface FileGalleryProps {
  files: GalleryFile[];
  open: boolean;
  onClose: () => void;
  initialIndex?: number;
}

// Helper to determine file type from URL
const getFileTypeFromUrl = (url: string): 'image' | 'document' => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.match(/\.(pdf|doc|docx)(\?|$)/i)) return 'document';
  if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i)) return 'image';
  // Default to image for Cloudinary URLs without clear extension
  return 'image';
};

// Helper to get file extension
const getFileExtension = (url: string): string => {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? match[1].toUpperCase() : 'FILE';
};

export function FileGallery({ files, open, onClose, initialIndex = 0 }: FileGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset index when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = () => {
    const file = files[currentIndex];
    const fileName = file.name || `file-${Date.now()}.${getFileExtension(file.url).toLowerCase()}`;

    // Use download proxy API to avoid CORS issues
    const downloadUrl = `/api/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(fileName)}`;
    window.open(downloadUrl, '_blank');
  };

  const openInNewTab = () => {
    window.open(files[currentIndex].url, '_blank');
  };

  if (!files || files.length === 0) {
    return null;
  }

  const currentFile = files[currentIndex];
  const fileType = currentFile.type || getFileTypeFromUrl(currentFile.url);
  const isPdf = currentFile.url.toLowerCase().includes('.pdf');
  const isWord = currentFile.url.toLowerCase().match(/\.(doc|docx)(\?|$)/);

  // Use Office Online viewer for Word files (more reliable than Google Docs)
  const getOfficeViewerUrl = (url: string) => {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {fileType === 'document' ? (
              <FileText size={20} className="text-red-500" />
            ) : null}
            <span>
              {fileType === 'image' ? 'Hình ảnh' : 'Tài liệu'} {currentIndex + 1} / {files.length}
            </span>
            {currentFile.name && (
              <span className="text-sm text-gray-500 font-normal ml-2">- {currentFile.name}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="relative flex-1 min-h-[50vh]">
          {fileType === 'image' ? (
            <img
              src={currentFile.url}
              alt={currentFile.name || `Image ${currentIndex + 1}`}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          ) : isPdf ? (
            <div className="w-full h-[70vh]">
              <object
                data={currentFile.url}
                type="application/pdf"
                className="w-full h-full border rounded"
              >
                <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded">
                  <FileText size={64} className="text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500 mb-4">Trình duyệt không hỗ trợ xem PDF</p>
                  <Button onClick={openInNewTab} variant="outline">
                    <ExternalLink size={16} className="mr-2" />
                    Mở trong tab mới
                  </Button>
                </div>
              </object>
            </div>
          ) : isWord ? (
            <div className="w-full h-[70vh]">
              <iframe
                src={getOfficeViewerUrl(currentFile.url)}
                className="w-full h-full border rounded"
                title={currentFile.name || `Document ${currentIndex + 1}`}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] bg-gray-50 rounded">
              <FileText size={64} className="text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">
                {getFileExtension(currentFile.url)} Document
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {currentFile.name || 'Không thể xem trước tài liệu này'}
              </p>
              <Button onClick={openInNewTab} variant="outline">
                <ExternalLink size={16} className="mr-2" />
                Mở trong tab mới
              </Button>
            </div>
          )}

          {files.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow"
                onClick={handlePrevious}
              >
                <ChevronLeft size={20} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow"
                onClick={handleNext}
              >
                <ChevronRight size={20} />
              </Button>
            </>
          )}
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-2">
            {files.map((file, index) => {
              const type = file.type || getFileTypeFromUrl(file.url);
              return (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex
                      ? type === 'image' ? 'bg-blue-600' : 'bg-red-500'
                      : 'bg-gray-300'
                  }`}
                  aria-label={`Đến ${type === 'image' ? 'hình ảnh' : 'tài liệu'} ${index + 1}`}
                />
              );
            })}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
            >
              <ExternalLink size={16} className="mr-2" />
              Mở tab mới
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download size={16} className="mr-2" />
              Tải xuống
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Backward compatibility: Export ImageGallery as an alias
export { FileGallery as ImageGallery };
