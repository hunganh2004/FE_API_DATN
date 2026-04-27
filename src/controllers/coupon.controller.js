import { Op } from 'sequelize';
import { Coupon } from '../models/index.js';
import { success, created, error } from '../utils/response.js';

const findValidCoupon = (code) => {
  const now = new Date();
  return Coupon.findOne({
    where: {
      code,
      is_active: 1,
      [Op.and]: [
        { [Op.or]: [{ starts_at: null }, { starts_at: { [Op.lte]: now } }] },
        { [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gte]: now } }] },
      ],
    },
  });
};

export const validate = async (req, res, next) => {
  try {
    const { code, order_total } = req.body;
    const coupon = await findValidCoupon(code);
    if (!coupon) return error(res, 'Mã giảm giá không hợp lệ hoặc đã hết hạn', 400);
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) return error(res, 'Mã giảm giá đã hết lượt sử dụng', 400);
    if (order_total < coupon.min_order) return error(res, `Đơn hàng tối thiểu ${Number(coupon.min_order).toLocaleString()}đ`, 400);

    const discount = coupon.discount_type === 'percent'
      ? (order_total * coupon.discount_value) / 100
      : Number(coupon.discount_value);

    return success(res, { coupon_id: coupon.pk_coupon_id, discount_amount: Math.min(discount, order_total) });
  } catch (err) { next(err); }
};

export const getAll = async (req, res, next) => {
  try {
    return success(res, await Coupon.findAll({ order: [['pk_coupon_id', 'DESC']] }));
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    return created(res, await Coupon.create(req.body));
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return error(res, 'Mã giảm giá không tồn tại', 404);
    await coupon.update(req.body);
    return success(res, coupon);
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return error(res, 'Mã giảm giá không tồn tại', 404);
    await coupon.destroy();
    return success(res, null, 'Xoá mã giảm giá thành công');
  } catch (err) { next(err); }
};
