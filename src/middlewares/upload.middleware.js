import multer from 'multer';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh: jpeg, png, webp, gif'), false);
  }
};

// Dùng memoryStorage — file lưu vào buffer, controller quyết định lưu đâu
const storage = multer.memoryStorage();

export const uploadSingle   = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } }).single('image');
export const uploadMultiple = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } }).array('images', 10);

export const FOLDER_PATTERN = /^(products|categories|avatars|misc)(\/\d+)?$/;
export const resolveFolder  = (raw) => (raw && FOLDER_PATTERN.test(raw) ? raw : 'misc');
