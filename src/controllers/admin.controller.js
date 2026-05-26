import { Op, QueryTypes, literal } from 'sequelize';
import sequelize from '../config/database.js';
import { Order, OrderItem, OrderStatusLog, Payment, User, UserAddress, Notification, CustomerSegment, Review, Product, ProductImage, UserBehaviorLog } from '../models/index.js';
import { success, paginated, error } from '../utils/response.js';
import { fetchAllSegments, trainAll, trainModel, isAIHealthy } from '../utils/aiClient.js';
import { sendPromotion } from '../utils/mailer.js';

// ── Đơn hàng ─────────────────────────────────────────────────

export const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, payment_status, date_from, date_to } = req.query;
    const where = {};
    if (status) where.order_status = status;
    if (payment_status) where.payment_status = payment_status;
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at[Op.gte] = new Date(date_from);
      if (date_to) {
        const end = new Date(date_to);
        end.setHours(23, 59, 59, 999);
        where.created_at[Op.lte] = end;
      }
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      distinct: true,
      include: [
        { model: User, as: 'user', attributes: ['pk_user_id', 'full_name', 'email', 'phone'] },
        { model: OrderItem, as: 'items' },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
    return paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

export const getOrderDetail = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['pk_user_id', 'full_name', 'email', 'phone'] },
        { model: OrderItem, as: 'items' },
        { model: Payment, as: 'payment' },
        { model: OrderStatusLog, as: 'statusLogs' },
      ],
    });
    if (!order) return error(res, 'Đơn hàng không tồn tại', 404);
    return success(res, order);
  } catch (err) { next(err); }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return error(res, 'Đơn hàng không tồn tại', 404);

    await order.update({ order_status: status });

    // COD: tự động đánh dấu đã thanh toán khi giao hàng thành công
    if (status === 'delivered' && order.payment_method === 'cod') {
      await order.update({ payment_status: 'paid' });
      await Payment.update(
        { status: 'success', paid_at: new Date() },
        { where: { fk_order_id: order.pk_order_id } }
      );
    }
    await OrderStatusLog.create({ fk_order_id: order.pk_order_id, status, note, fk_changed_by: req.user.pk_user_id });
    await Notification.create({
      fk_user_id: order.fk_user_id, type: 'order_update',
      title: 'Cập nhật đơn hàng',
      message: `Đơn hàng #${order.pk_order_id} đã chuyển sang trạng thái: ${status}`,
      ref_id: order.pk_order_id,
    });

    return success(res, null, 'Cập nhật trạng thái thành công');
  } catch (err) { next(err); }
};

// ── Người dùng ────────────────────────────────────────────────

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const where = { role: 'customer' };
    if (q) where[Op.or] = [
      { full_name: { [Op.like]: `%${q}%` } },
      { email: { [Op.like]: `%${q}%` } },
      { phone: { [Op.like]: `%${q}%` } },
    ];

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
    return paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

export const getUserDetail = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: UserAddress, as: 'addresses' },
        { model: CustomerSegment, as: 'segments', through: { attributes: [] } },
      ],
    });
    if (!user) return error(res, 'Người dùng không tồn tại', 404);

    // Thống kê tổng hợp
    const stats = await sequelize.query(
      `SELECT
        COUNT(*) AS total_orders,
        SUM(CASE WHEN order_status != 'cancelled' THEN total ELSE 0 END) AS total_spent,
        SUM(CASE WHEN order_status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders,
        MAX(CASE WHEN order_status != 'cancelled' THEN created_at END) AS last_order_at
       FROM tbl_orders
       WHERE fk_user_id = :userId`,
      { replacements: { userId: req.params.id }, type: QueryTypes.SELECT }
    );

    // Top sản phẩm hay mua nhất
    const topProducts = await sequelize.query(
      `SELECT p.pk_product_id, p.name, SUM(oi.quantity) AS total_bought
       FROM tbl_order_items oi
       JOIN tbl_products p ON p.pk_product_id = oi.fk_product_id
       JOIN tbl_orders o ON o.pk_order_id = oi.fk_order_id
       WHERE o.fk_user_id = :userId AND o.order_status != 'cancelled'
       GROUP BY p.pk_product_id
       ORDER BY total_bought DESC
       LIMIT 5`,
      { replacements: { userId: req.params.id }, type: QueryTypes.SELECT }
    );

    return success(res, {
      user,
      stats: stats[0],
      top_products: topProducts,
    });
  } catch (err) { next(err); }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: ['pk_user_id'] });
    if (!user) return error(res, 'Người dùng không tồn tại', 404);

    const { page = 1, limit = 10, status, payment_status } = req.query;
    const where = { fk_user_id: req.params.id };
    if (status) where.order_status = status;
    if (payment_status) where.payment_status = payment_status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { model: Payment, as: 'payment' },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      distinct: true,
    });
    return paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

export const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'Người dùng không tồn tại', 404);
    await user.update({ is_active: user.is_active ? 0 : 1 });
    return success(res, null, user.is_active ? 'Đã mở khoá tài khoản' : 'Đã khoá tài khoản');
  } catch (err) { next(err); }
};

// ── Thống kê ──────────────────────────────────────────────────

export const getRevenue = async (req, res, next) => {
  try {
    const { period = 'month', year = new Date().getFullYear(), month, week } = req.query;

    let sql, replacements;

    if (period === 'all') {
      // Tổng doanh thu toàn thời gian — gộp theo từng năm
      sql = `SELECT order_year AS year,
                    SUM(total_orders) AS total_orders, SUM(revenue) AS revenue
             FROM v_revenue_by_date
             GROUP BY order_year
             ORDER BY order_year`;
      replacements = {};
    } else if (period === 'week' && week) {
      // Doanh thu theo tuần cụ thể — trả về từng ngày trong tuần đó
      sql = `SELECT order_date, order_month, order_year, total_orders, revenue
             FROM v_revenue_by_date
             WHERE order_year = :year AND WEEK(order_date, 1) = :week
             ORDER BY order_date`;
      replacements = { year, week };
    } else if (period === 'year') {
      // Doanh thu theo năm — gộp theo từng tháng (12 tháng)
      sql = `SELECT order_month AS month, order_year AS year,
                    SUM(total_orders) AS total_orders, SUM(revenue) AS revenue
             FROM v_revenue_by_date
             WHERE order_year = :year
             GROUP BY order_month, order_year
             ORDER BY order_month`;
      replacements = { year };
    } else {
      // Doanh thu theo tháng cụ thể — trả về từng ngày trong tháng đó
      const m = month || new Date().getMonth() + 1;
      sql = `SELECT order_date, order_month, order_year, total_orders, revenue
             FROM v_revenue_by_date
             WHERE order_year = :year AND order_month = :month
             ORDER BY order_date`;
      replacements = { year, month: m };
    }

    const rows = await sequelize.query(sql, { replacements, type: QueryTypes.SELECT });
    return success(res, rows);
  } catch (err) { next(err); }
};

export const getTopProducts = async (req, res, next) => {
  try {
    const { period = 'all', year, month, week } = req.query;
    const y = parseInt(year) || new Date().getFullYear();

    let orderFilter = "order_status = 'delivered'";
    const replacements = {};

    if (period === 'week' && week) {
      orderFilter += ' AND WEEK(created_at, 1) = :week AND YEAR(created_at) = :year';
      replacements.week = parseInt(week);
      replacements.year = y;
    } else if (period === 'month' && month) {
      orderFilter += ' AND MONTH(created_at) = :month AND YEAR(created_at) = :year';
      replacements.month = parseInt(month);
      replacements.year = y;
    } else if (period === 'year') {
      orderFilter += ' AND YEAR(created_at) = :year';
      replacements.year = y;
    }

    const rows = await sequelize.query(
      `SELECT p.pk_product_id, p.name, p.price,
              COALESCE(SUM(oi.quantity), 0) AS total_sold,
              COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue,
              COALESCE(AVG(r.rating), 0) AS avg_rating
       FROM tbl_products p
       LEFT JOIN tbl_order_items oi ON oi.fk_product_id = p.pk_product_id
           AND oi.fk_order_id IN (SELECT pk_order_id FROM tbl_orders WHERE ${orderFilter})
       LEFT JOIN tbl_reviews r ON r.fk_product_id = p.pk_product_id
       GROUP BY p.pk_product_id
       ORDER BY total_sold DESC
       LIMIT 20`,
      { replacements, type: QueryTypes.SELECT }
    );
    return success(res, rows);
  } catch (err) { next(err); }
};

export const getCustomerSegments = async (req, res, next) => {
  try {
    // Ưu tiên lấy từ AI Service (có user_count realtime), fallback về DB
    try {
      const segments = await fetchAllSegments();
      return success(res, segments);
    } catch {
      return success(res, await CustomerSegment.findAll());
    }
  } catch (err) { next(err); }
};

// ── AI Training ───────────────────────────────────────────────

export const trainAllModels = async (req, res, next) => {
  try {
    const result = await trainAll();
    return success(res, result, 'Đã bắt đầu huấn luyện tất cả mô hình');
  } catch {
    return error(res, 'Không thể kết nối AI Service', 503);
  }
};

export const trainSingleModel = async (req, res, next) => {
  try {
    const { model } = req.params;
    const allowed = ['association', 'collaborative', 'clustering', 'repurchase'];
    if (!allowed.includes(model)) return error(res, 'Mô hình không hợp lệ', 400);

    const result = await trainModel(model);
    return success(res, result, `Đã huấn luyện mô hình ${model}`);
  } catch {
    return error(res, 'Không thể kết nối AI Service', 503);
  }
};

export const getAIHealth = async (req, res, next) => {
  try {
    const healthy = await isAIHealthy();
    return success(res, { ai_service: healthy ? 'online' : 'offline' });
  } catch (err) { next(err); }
};

// ── Thông báo (Admin) ─────────────────────────────────────────

export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, user_id, is_read } = req.query;
    const where = {};
    if (type) where.type = type;
    if (user_id) where.fk_user_id = user_id;
    if (is_read !== undefined) where.is_read = parseInt(is_read);

    const { count, rows } = await Notification.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['pk_user_id', 'full_name', 'email'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
    return paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

export const sendNotification = async (req, res, next) => {
  try {
    const { user_id, type = 'system', title, message, ref_id } = req.body;

    // Gửi đến tất cả user nếu không truyền user_id
    if (!user_id) {
      const users = await User.findAll({ where: { role: 'customer', is_active: 1 }, attributes: ['pk_user_id', 'full_name', 'email'] });
      await Notification.bulkCreate(
        users.map(u => ({ fk_user_id: u.pk_user_id, type, title, message, ref_id: ref_id || null }))
      );
      // Gửi email nếu là promotion hoặc repurchase_reminder
      if (['promotion', 'repurchase_reminder'].includes(type)) {
        users.forEach(u => sendPromotion(u.email, u.full_name, title, message).catch(() => {}));
      }
      return success(res, null, `Đã gửi thông báo đến ${users.length} người dùng`, 201);
    }

    const user = await User.findByPk(user_id);
    if (!user) return error(res, 'Người dùng không tồn tại', 404);

    const notif = await Notification.create({ fk_user_id: user_id, type, title, message, ref_id: ref_id || null });
    if (['promotion', 'repurchase_reminder'].includes(type)) {
      sendPromotion(user.email, user.full_name, title, message).catch(() => {});
    }
    return success(res, notif, 'Gửi thông báo thành công', 201);
  } catch (err) { next(err); }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notif = await Notification.findByPk(req.params.id);
    if (!notif) return error(res, 'Thông báo không tồn tại', 404);
    await notif.destroy();
    return success(res, null, 'Xoá thông báo thành công');
  } catch (err) { next(err); }
};

// ── Sản phẩm sắp hết hạn ─────────────────────────────────────

export const getExpiringProducts = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);

    const products = await Product.findAll({
      where: {
        is_active: 1,
        is_consumable: 1,
        expiry_date: { [Op.between]: [new Date(), threshold] },
      },
      include: [{ model: ProductImage, as: 'images', where: { is_primary: 1 }, required: false }],
      order: [['expiry_date', 'ASC']],
    });

    const result = products.map(p => {
      const plain = p.toJSON();
      plain.days_until_expiry = Math.ceil((new Date(plain.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
      return plain;
    });

    return success(res, result);
  } catch (err) { next(err); }
};

export const getBehaviorStats = async (req, res, next) => {
  try {
    const { period, year, month, week } = req.query;
    const y = year || new Date().getFullYear();

    let dateFilter = '';
    const replacements = {};

    if (period === 'week' && week) {
      dateFilter = 'WHERE WEEK(created_at, 1) = :week AND YEAR(created_at) = :year';
      replacements.week = week;
      replacements.year = y;
    } else if (period === 'month' && month) {
      dateFilter = 'WHERE MONTH(created_at) = :month AND YEAR(created_at) = :year';
      replacements.month = month;
      replacements.year = y;
    } else if (period === 'year') {
      dateFilter = 'WHERE YEAR(created_at) = :year';
      replacements.year = y;
    }

    const rows = await sequelize.query(
      `SELECT action, COUNT(*) as count FROM tbl_user_behavior_logs ${dateFilter} GROUP BY action`,
      { replacements, type: QueryTypes.SELECT }
    );
    return success(res, rows);
  } catch (err) { next(err); }
};

export const getBehaviorLogs = async (req, res, next) => {
  try {
    const { user_id, action, page = 1, limit = 50 } = req.query;
    const where = {};
    if (user_id) where.fk_user_id = user_id;
    if (action) where.action = action;

    const { count, rows } = await UserBehaviorLog.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['pk_user_id', 'full_name', 'email'], required: false },
        { model: Product, as: 'product', attributes: ['pk_product_id', 'name'], required: false },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
    return paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

// ── Payments ──────────────────────────────────────────────────

export const getPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, method } = req.query;
    const where = {};
    if (status) where.status = status;
    if (method) where.method = method;

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [{
        model: Order, as: 'order',
        include: [{ model: User, as: 'user', attributes: ['pk_user_id', 'full_name', 'email'] }],
      }],
      order: [['pk_payment_id', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
    return paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

export const getPaymentDetail = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [{
        model: Order, as: 'order',
        include: [
          { model: User, as: 'user', attributes: ['pk_user_id', 'full_name', 'email', 'phone'] },
          { model: OrderItem, as: 'items' },
        ],
      }],
    });
    if (!payment) return error(res, 'Không tìm thấy thông tin thanh toán', 404);
    return success(res, payment);
  } catch (err) { next(err); }
};

export const refundPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [{ model: Order, as: 'order' }],
    });
    if (!payment) return error(res, 'Không tìm thấy thông tin thanh toán', 404);
    if (payment.status !== 'success') return error(res, 'Chỉ có thể hoàn tiền giao dịch đã thành công', 400);
    if (payment.method === 'cod') return error(res, 'Không thể hoàn tiền tự động với phương thức COD', 400);

    // Cập nhật trạng thái payment về refunded
    await payment.update({ status: 'refunded' });
    await Order.update(
      { payment_status: 'refunded' },
      { where: { pk_order_id: payment.fk_order_id } }
    );

    // Gửi thông báo cho user
    await Notification.create({
      fk_user_id: payment.order.fk_user_id,
      type: 'order_update',
      title: 'Hoàn tiền thành công',
      message: `Đơn hàng #${payment.fk_order_id} đã được hoàn tiền ${Number(payment.amount).toLocaleString('vi-VN')}đ.`,
      ref_id: payment.fk_order_id,
    });

    return success(res, null, 'Đã cập nhật trạng thái hoàn tiền');
  } catch (err) { next(err); }
};

// ── Reviews ───────────────────────────────────────────────────

export const getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, product_id, rating, replied } = req.query;
    const where = { fk_parent_id: null };
    if (product_id) where.fk_product_id = product_id;
    if (rating) where.rating = parseInt(rating);

    // Filter replied=false bằng subquery: review không có bất kỳ reply nào
    if (replied === 'false') {
      where.pk_review_id = {
        [Op.notIn]: literal(
          '(SELECT DISTINCT fk_parent_id FROM tbl_reviews WHERE fk_parent_id IS NOT NULL)'
        ),
      };
    }

    const { count, rows } = await Review.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['pk_user_id', 'full_name', 'email'] },
        { model: Product, as: 'product', attributes: ['pk_product_id', 'name'] },
        { model: Review, as: 'replies', include: [{ model: User, as: 'user', attributes: ['pk_user_id', 'full_name'] }] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      distinct: true,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return error(res, 'Đánh giá không tồn tại', 404);
    await review.destroy();
    return success(res, null, 'Xoá đánh giá thành công');
  } catch (err) { next(err); }
};

export const replyReview = async (req, res, next) => {
  try {
    const parent = await Review.findByPk(req.params.id);
    if (!parent) return error(res, 'Đánh giá không tồn tại', 404);
    if (parent.fk_parent_id) return error(res, 'Không thể reply vào một reply', 400);

    const reply = await Review.create({
      fk_product_id: parent.fk_product_id,
      fk_user_id: req.user.pk_user_id,
      fk_parent_id: parent.pk_review_id,
      rating: null,
      comment: req.body.comment,
    });
    return success(res, reply, 'Phản hồi thành công', 201);
  } catch (err) { next(err); }
};
