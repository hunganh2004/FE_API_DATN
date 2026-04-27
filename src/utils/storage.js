import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

if (IS_PRODUCTION) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload buffer lên Cloudinary hoặc lưu file local tuỳ môi trường.
 * @param {Buffer} buffer - nội dung file
 * @param {string} filename - tên file gốc (dùng để lấy ext)
 * @param {string} folder - subfolder, vd: "products/1"
 * @returns {Promise<string>} URL tương đối (local) hoặc URL tuyệt đối (Cloudinary)
 */
export const saveFile = async (buffer, filename, folder = 'misc') => {
  if (IS_PRODUCTION) {
    return uploadToCloudinary(buffer, filename, folder);
  }
  return saveToLocal(buffer, filename, folder);
};

/**
 * Xóa file theo URL đã lưu.
 * @param {string} fileUrl
 */
export const removeFile = async (fileUrl) => {
  if (!fileUrl) return;
  if (IS_PRODUCTION) {
    return deleteFromCloudinary(fileUrl);
  }
  return deleteFromLocal(fileUrl);
};

// ── Local ─────────────────────────────────────────────────────

const saveToLocal = (buffer, filename, folder) => {
  const ext = path.extname(filename).toLowerCase();
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  const uploadPath = path.join(__dirname, '..', '..', 'uploads', folder);
  fs.mkdirSync(uploadPath, { recursive: true });
  const savedName = `${unique}${ext}`;
  fs.writeFileSync(path.join(uploadPath, savedName), buffer);
  return `/uploads/${folder}/${savedName}`;
};

const deleteFromLocal = (fileUrl) => {
  const normalized = fileUrl.replace(/^\/+/, '');
  const filePath = normalized.startsWith('uploads/')
    ? path.join(__dirname, '..', '..', normalized)
    : path.join(__dirname, '..', '..', 'uploads', normalized);
  fs.unlink(filePath, () => {});
};

// ── Cloudinary ────────────────────────────────────────────────

const uploadToCloudinary = (buffer, filename, folder) => {
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

const deleteFromCloudinary = async (fileUrl) => {
  // Lấy public_id từ URL: .../pet-shop/products/1/<filename>.<ext>
  const match = fileUrl.match(/pet-shop\/.+\/([^/.]+)/);
  if (!match) return;
  // Reconstruct full public_id bao gồm folder
  const urlPath = fileUrl.split('/upload/')[1];
  if (!urlPath) return;
  // Bỏ version (v1234567/) nếu có và extension
  const publicId = urlPath.replace(/^v\d+\//, '').replace(/\.[^.]+$/, '');
  await cloudinary.uploader.destroy(publicId);
};
