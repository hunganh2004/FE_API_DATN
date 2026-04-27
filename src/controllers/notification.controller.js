import { Notification } from '../models/index.js';
import { success, error } from '../utils/response.js';
import { Op } from 'sequelize';

export const getAll = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { fk_user_id: req.user.pk_user_id },
      order: [['created_at', 'DESC']],
      limit: 50,
    });
    return success(res, notifications);
  } catch (err) { next(err); }
};

export const markRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOne({ where: { pk_notif_id: req.params.id, fk_user_id: req.user.pk_user_id } });
    if (!notif) return error(res, 'Thông báo không tồn tại', 404);
    await notif.update({ is_read: 1 });
    return success(res, null, 'Đã đánh dấu đã đọc');
  } catch (err) { next(err); }
};

export const markAllRead = async (req, res, next) => {
  try {
    await Notification.update({ is_read: 1 }, { where: { fk_user_id: req.user.pk_user_id, is_read: 0 } });
    return success(res, null, 'Đã đánh dấu tất cả là đã đọc');
  } catch (err) { next(err); }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.count({
      where: { fk_user_id: req.user.pk_user_id, is_read: 0 },
    });
    return success(res, { unread_count: count });
  } catch (err) { next(err); }
};

export const deleteOne = async (req, res, next) => {
  try {
    const notif = await Notification.findOne({
      where: { pk_notif_id: req.params.id, fk_user_id: req.user.pk_user_id },
    });
    if (!notif) return error(res, 'Thông báo không tồn tại', 404);
    await notif.destroy();
    return success(res, null, 'Đã xoá thông báo');
  } catch (err) { next(err); }
};
