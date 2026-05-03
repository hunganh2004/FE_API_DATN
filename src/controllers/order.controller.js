import sequelize from '../config/database.js';
import { Order, OrderItem, OrderStatusLog, Payment, CartItem, Product, ProductVariant, Coupon, Notification, User } from '../models/index.js';
import { success, created, paginated, error } from '../utils/response.js';
import { sendOrderConfirm } from '../utils/mailer.js';

export const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const where = { fk_user_id: req.user.pk_user_id };
    if (status) where.order_status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: OrderItem, as: 'items' }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
    return paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

export const getOrderDetail = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { pk_order_id: req.params.id, fk_user_id: req.user.pk_user_id },
      include: [
        { model: OrderItem, as: 'items' },
        { model: Payment, as: 'payment' },
        { model: OrderStatusLog, as: 'statusLogs' },
        { model: Coupon, as: 'coupon', attributes: ['code', 'discount_type', 'discount_value'] },
      ],
    });
    if (!order) return error(res, 'Đơn hàng không tồn tại', 404);
    return success(res, order);
  } catch (err) { next(err); }
};

export const createOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { receiver, phone, shipping_address, payment_method, coupon_code, note } = req.body;
    const userId = req.user.pk_user_id;

    const cartItems = await CartItem.findAll({
      where: { fk_user_id: userId },
      include: [{ model: Product, as: 'product' }, { model: ProductVariant, as: 'variant' }],
      transaction: t,
    });
    if (!cartItems.length) { await t.rollback(); return error(res, 'Giỏ hàng trống', 400); }

    // Kiểm tra tồn kho
    for (const item of cartItems) {
      const stock = item.fk_variant_id ? item.variant?.stock : item.product?.stock;
      if (stock < item.quantity) {
        await t.rollback();
        return error(res, `Sản phẩm "${item.product.name}" không đủ hàng`, 409);
      }
    }

    // Tính subtotal
    let subtotal = cartItems.reduce((sum, item) => {
      const price = item.fk_variant_id
        ? Number(item.variant.sale_price || item.variant.price)
        : Number(item.product.sale_price || item.product.price);
      return sum + price * item.quantity;
    }, 0);

    // Áp mã giảm giá
    let discount_amount = 0;
    let coupon = null;
    if (coupon_code) {
      coupon = await Coupon.findOne({ where: { code: coupon_code, is_active: 1 }, transaction: t });
      if (coupon) {
        discount_amount = coupon.discount_type === 'percent'
          ? (subtotal * coupon.discount_value) / 100
          : Number(coupon.discount_value);
        discount_amount = Math.min(discount_amount, subtotal);
        await Coupon.increment('used_count', { where: { pk_coupon_id: coupon.pk_coupon_id }, transaction: t });
      }
    }

    const shipping_fee = 30000;
    const total = subtotal - discount_amount + shipping_fee;

    const order = await Order.create({
      fk_user_id: userId, fk_coupon_id: coupon?.pk_coupon_id || null,
      receiver, phone, shipping_address, subtotal, discount_amount, shipping_fee, total,
      payment_method, note,
    }, { transaction: t });

    // Tạo order items & trừ tồn kho
    for (const item of cartItems) {
      const price = item.fk_variant_id
        ? Number(item.variant.sale_price || item.variant.price)
        : Number(item.product.sale_price || item.product.price);

      await OrderItem.create({
        fk_order_id: order.pk_order_id, fk_product_id: item.fk_product_id,
        fk_variant_id: item.fk_variant_id || null, product_name: item.product.name,
        unit_price: price, quantity: item.quantity,
      }, { transaction: t });

      const target = item.fk_variant_id
        ? ProductVariant.update({ stock: sequelize.literal(`stock - ${item.quantity}`) }, { where: { pk_variant_id: item.fk_variant_id }, transaction: t })
        : Product.update({ stock: sequelize.literal(`stock - ${item.quantity}`) }, { where: { pk_product_id: item.fk_product_id }, transaction: t });
      await target;
    }

    await Payment.create({ fk_order_id: order.pk_order_id, method: payment_method, amount: total }, { transaction: t });
    await OrderStatusLog.create({ fk_order_id: order.pk_order_id, status: 'pending', note: 'Đơn hàng vừa được tạo' }, { transaction: t });
    await CartItem.destroy({ where: { fk_user_id: userId }, transaction: t });
    await Notification.create({
      fk_user_id: userId, type: 'order_update',
      title: 'Đặt hàng thành công',
      message: `Đơn hàng #${order.pk_order_id} đã được tạo thành công.`,
      ref_id: order.pk_order_id,
    }, { transaction: t });

    await t.commit();

    // Gửi email xác nhận đơn hàng
    sendOrderConfirm(req.user.email, req.user.full_name, order.pk_order_id, total).catch(() => {});

    return created(res, { order_id: order.pk_order_id, total }, 'Đặt hàng thành công');
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

export const cancelOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findOne({
      where: { pk_order_id: req.params.id, fk_user_id: req.user.pk_user_id },
      include: [{ model: OrderItem, as: 'items' }],
      transaction: t,
    });
    if (!order) { await t.rollback(); return error(res, 'Đơn hàng không tồn tại', 404); }
    if (!['pending', 'confirmed'].includes(order.order_status)) {
      await t.rollback();
      return error(res, 'Không thể huỷ đơn hàng ở trạng thái này', 400);
    }

    await order.update({ order_status: 'cancelled' }, { transaction: t });

    for (const item of order.items) {
      if (item.fk_variant_id) {
        await ProductVariant.update({ stock: sequelize.literal(`stock + ${item.quantity}`) }, { where: { pk_variant_id: item.fk_variant_id }, transaction: t });
      } else {
        await Product.update({ stock: sequelize.literal(`stock + ${item.quantity}`) }, { where: { pk_product_id: item.fk_product_id }, transaction: t });
      }
    }

    await OrderStatusLog.create({ fk_order_id: order.pk_order_id, status: 'cancelled', note: 'Người dùng huỷ đơn', fk_changed_by: req.user.pk_user_id }, { transaction: t });
    await t.commit();
    return success(res, null, 'Huỷ đơn hàng thành công');
  } catch (err) {
    await t.rollback();
    next(err);
  }
};
