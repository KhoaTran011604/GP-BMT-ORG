import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to generate unique public_id (without extension - Cloudinary adds it automatically)
function generatePublicId(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${sanitizedName}_${timestamp}_${random}`;
}

export async function uploadImages(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(async (file) => {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const isImage = file.type.startsWith('image/');

    // For images: use 'image' resource type with transformations
    // For PDFs: use 'image' resource type (Cloudinary handles PDFs as images)
    // For DOC/DOCX: use 'raw' with extension in public_id
    const uploadOptions: any = {
      folder: process.env.CLOUDINARY_FOLDER || 'gpbmt-finance',
    };

    if (isImage) {
      uploadOptions.resource_type = 'image';
      uploadOptions.transformation = [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' }
      ];
    } else {
      // PDF, DOC, DOCX - upload as 'auto' to let Cloudinary decide
      // Use unique public_id with extension preserved for proper file handling
      uploadOptions.resource_type = 'auto';
      uploadOptions.public_id = generatePublicId(file.name);
    }

    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

    return result.secure_url;
  });

  return Promise.all(uploadPromises);
}

export async function deleteImage(url: string): Promise<void> {
  try {
    const publicId = extractPublicId(url);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
  }
}

function extractPublicId(url: string): string | null {
  try {
    const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
    return matches ? matches[1] : null;
  } catch {
    return null;
  }
}

export default cloudinary;
