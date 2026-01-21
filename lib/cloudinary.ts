import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImages(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(async (file) => {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: process.env.FOLDER || 'gpbmt-finance',
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

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
