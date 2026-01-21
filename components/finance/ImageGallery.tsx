'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Download } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  open: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export function ImageGallery({ images, open, onClose, initialIndex = 0 }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `image-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Image {currentIndex + 1} of {images.length}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="w-full h-auto max-h-[70vh] object-contain"
          />

          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={handlePrevious}
              >
                <ChevronLeft size={20} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={handleNext}
              >
                <ChevronRight size={20} />
              </Button>
            </>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download size={16} className="mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
