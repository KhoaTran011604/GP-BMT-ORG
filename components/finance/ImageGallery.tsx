'use client';

import { FileGallery } from './FileGallery';

interface GalleryFile {
  url: string;
  type?: 'image' | 'document';
  name?: string;
}

// Helper to determine file type from URL
const getFileTypeFromUrl = (url: string): 'image' | 'document' => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.match(/\.(pdf|doc|docx)(\?|$)/i)) return 'document';
  if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i)) return 'image';
  // Default to image for Cloudinary URLs without clear extension
  return 'image';
};

interface ImageGalleryProps {
  images: string[];
  open: boolean;
  onClose: () => void;
  initialIndex?: number;
}

// Backward compatible ImageGallery wrapper
export function ImageGallery({ images, open, onClose, initialIndex = 0 }: ImageGalleryProps) {
  // Convert string[] to GalleryFile[]
  const files: GalleryFile[] = (images || []).map(url => ({
    url,
    type: getFileTypeFromUrl(url)
  }));

  return (
    <FileGallery
      files={files}
      open={open}
      onClose={onClose}
      initialIndex={initialIndex}
    />
  );
}

// Also export FileGallery for direct use
export { FileGallery };
