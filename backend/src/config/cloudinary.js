import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configure Cloudinary from Environment Variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'deif5qkqe',
  api_key: process.env.CLOUDINARY_API_KEY || '112222119889218',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'aTET8S3S8QPI50OoPRFddGZz4ng'
});

// Configure Multer Memory Storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max file size
});

// Helper function to upload image stream to Cloudinary
export const uploadToCloudinary = (fileBuffer, folder = 'hms_uploads', mimetype = 'image/png') => {
  return new Promise((resolve) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.warn('Cloudinary upload warning, using inline data URI:', error.message);
          const base64Data = fileBuffer.toString('base64');
          const dataUri = `data:${mimetype || 'image/png'};base64,${base64Data}`;
          return resolve({ secure_url: dataUri, public_id: 'local_fallback' });
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;
