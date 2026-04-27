import { uploadSingle, uploadMultiple, resolveFolder } from '../middlewares/upload.middleware.js';
import { saveFile } from '../utils/storage.js';
import { success, error } from '../utils/response.js';

// POST /upload  (single)
export const uploadOne = (req, res, next) => {
  uploadSingle(req, res, async (err) => {
    if (err) return error(res, err.message, 400);
    if (!req.file) return error(res, 'Không có file nào được tải lên', 400);
    try {
      const folder = resolveFolder(req.query.folder);
      const url = await saveFile(req.file.buffer, req.file.originalname, folder);
      return success(res, { url }, 'Tải ảnh lên thành công');
    } catch (e) { next(e); }
  });
};

// POST /upload/multiple  (nhiều file)
export const uploadMany = (req, res, next) => {
  uploadMultiple(req, res, async (err) => {
    if (err) return error(res, err.message, 400);
    if (!req.files?.length) return error(res, 'Không có file nào được tải lên', 400);
    try {
      const folder = resolveFolder(req.query.folder);
      const urls = await Promise.all(
        req.files.map(f => saveFile(f.buffer, f.originalname, folder))
      );
      return success(res, { urls }, 'Tải ảnh lên thành công');
    } catch (e) { next(e); }
  });
};
