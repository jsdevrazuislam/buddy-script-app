import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/** Maximum image upload size: 5 MB */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5,242,880 bytes

export const generateSignedUploadUrl = async (folder: string = 'social_feed') => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  // Include params that are REQUIRED to be signed
  const signParams = {
    timestamp,
    folder,
  };

  const signature = cloudinary.utils.api_sign_request(
    signParams,
    process.env.CLOUDINARY_API_SECRET as string,
  );

  return {
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
    maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
  };
};

export default cloudinary;
