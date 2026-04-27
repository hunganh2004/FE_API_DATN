import { UserAddress } from '../models/index.js';
import { success, error } from '../utils/response.js';
import { deleteUploadedFile } from '../utils/fileHelper.js';

export const getProfile = (req, res) => {
  const u = req.user;
  return success(res, {
    id: u.pk_user_id, full_name: u.full_name, email: u.email,
    phone: u.phone, avatar_url: u.avatar_url, role: u.role, created_at: u.created_at,
  });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, avatar_url } = req.body;
    const user = req.user;
    if (full_name) user.full_name = full_name;
    if (phone !== undefined) user.phone = phone;
    if (avatar_url !== undefined) {
      if (user.avatar_url && user.avatar_url !== avatar_url) {
        deleteUploadedFile(user.avatar_url);
      }
      user.avatar_url = avatar_url;
    }
    await user.save();
    return success(res, null, 'Cập nhật thông tin thành công');
  } catch (err) { next(err); }
};

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await UserAddress.findAll({ where: { fk_user_id: req.user.pk_user_id } });
    return success(res, addresses);
  } catch (err) { next(err); }
};

export const addAddress = async (req, res, next) => {
  try {
    const { receiver, phone, province, commune, street, is_default } = req.body;
    const userId = req.user.pk_user_id;
    if (is_default) await UserAddress.update({ is_default: 0 }, { where: { fk_user_id: userId } });
    const addr = await UserAddress.create({ fk_user_id: userId, receiver, phone, province, commune, street, is_default: is_default ? 1 : 0 });
    return success(res, addr, 'Thêm địa chỉ thành công', 201);
  } catch (err) { next(err); }
};

export const updateAddress = async (req, res, next) => {
  try {
    const addr = await UserAddress.findOne({ where: { pk_address_id: req.params.id, fk_user_id: req.user.pk_user_id } });
    if (!addr) return error(res, 'Địa chỉ không tồn tại', 404);
    const { receiver, phone, province, commune, street } = req.body;
    Object.assign(addr, { receiver, phone, province, commune, street });
    await addr.save();
    return success(res, addr);
  } catch (err) { next(err); }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const addr = await UserAddress.findOne({ where: { pk_address_id: req.params.id, fk_user_id: req.user.pk_user_id } });
    if (!addr) return error(res, 'Địa chỉ không tồn tại', 404);
    await addr.destroy();
    return success(res, null, 'Xoá địa chỉ thành công');
  } catch (err) { next(err); }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const userId = req.user.pk_user_id;
    const addr = await UserAddress.findOne({ where: { pk_address_id: req.params.id, fk_user_id: userId } });
    if (!addr) return error(res, 'Địa chỉ không tồn tại', 404);
    await UserAddress.update({ is_default: 0 }, { where: { fk_user_id: userId } });
    addr.is_default = 1;
    await addr.save();
    return success(res, null, 'Đặt địa chỉ mặc định thành công');
  } catch (err) { next(err); }
};
