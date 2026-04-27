// Re-export removeFile từ storage adapter để các controller khác dùng thống nhất
export { removeFile as deleteUploadedFile } from './storage.js';
