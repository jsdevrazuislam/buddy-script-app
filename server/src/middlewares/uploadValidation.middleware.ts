import { Request, Response, NextFunction } from 'express';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_FILE_SIZE_MB = 5;

/**
 * Validates that the incoming request body does not exceed the maximum allowed
 * file size (5 MB). This acts as a backend guard before any upload processing.
 *
 * Note: Cloudinary already enforces max_file_size in the signed URL params.
 * This middleware provides an additional layer of protection for any direct
 * multipart or base64 upload endpoints.
 */
export const validateImageUpload = (req: Request, res: Response, next: NextFunction): void => {
  const contentLength = parseInt(req.headers['content-length'] ?? '0', 10);

  if (contentLength > MAX_FILE_SIZE_BYTES) {
    res.status(413).json({
      status: 'error',
      statusCode: 413,
      message: `File too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`,
    });
    return;
  }

  next();
};

/**
 * Validates base64-encoded image strings embedded in JSON body.
 * Rejects if the decoded image data would exceed 5 MB.
 */
export const validateBase64Image =
  (field: string) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const value = req.body?.[field];

    if (value && typeof value === 'string' && value.startsWith('data:image/')) {
      // Remove the data URI prefix and calculate raw byte size
      const base64Data = value.split(',')[1] ?? '';
      const estimatedBytes = Math.ceil((base64Data.length * 3) / 4);

      if (estimatedBytes > MAX_FILE_SIZE_BYTES) {
        res.status(413).json({
          status: 'error',
          statusCode: 413,
          message: `Image exceeds maximum allowed size of ${MAX_FILE_SIZE_MB} MB.`,
        });
        return;
      }
    }

    next();
  };
