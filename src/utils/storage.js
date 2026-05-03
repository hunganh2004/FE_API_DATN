import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload buffer lên Cloudinary.
 * @param {Buffer} buffer
 * @param {string} filename - tên file gốc (dùng để lấy ext)
 * @param {string} folder - subfolder, vd: "products/1"
 * @returns {Promise<string>} secure_url từ Cloudinary
 */
export const saveFile = (buffer, filename, folder = 'misc') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `pet-shop/${folder}`, resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Xóa file trên Cloudinary theo URL.
 * @param {string} fileUrl
 */
export const removeFile = async (fileUrl) => {
  if (!fileUrl) return;
  // Chỉ xử lý URL Cloudinary
  if (!fileUrl.includes('cloudinary.com')) return;
  const urlPath = fileUrl.split('/upload/')[1];
  if (!urlPath) return;
  // Bỏ version (v1234567/) và extension
  const publicId = urlPath.replace(/^v\d+\//, '').replace(/\.[^.]+$/, '');
  await cloudinary.uploader.destroy(publicId);
};
