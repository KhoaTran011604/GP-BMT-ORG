'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUpload({ images, onChange, maxImages = 5, disabled = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { urls } = await response.json();
        onChange([...images, ...urls]);
        setUploadProgress(100);
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((url, index) => (
            <div key={index} className="relative w-24 h-24 group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover rounded border border-gray-200"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && !disabled && (
        <>
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById('file-input')?.click()}
            className="w-full sm:w-auto"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={16} />
                Uploading... {uploadProgress > 0 && `${uploadProgress}%`}
              </>
            ) : (
              <>
                <Upload className="mr-2" size={16} />
                Upload Images ({images.length}/{maxImages})
              </>
            )}
          </Button>

          <input
            id="file-input"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </>
      )}

      {images.length === 0 && (
        <p className="text-sm text-gray-500">
          No images uploaded. You can upload up to {maxImages} images.
        </p>
      )}
    </div>
  );
}
