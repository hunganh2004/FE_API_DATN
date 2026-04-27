import {
  fetchHomepageRecommendations,
  fetchProductRecommendations,
  fetchRepurchaseReminders,
} from '../utils/aiClient.js';
import { Product, ProductImage, Notification } from '../models/index.js';
import { success } from '../utils/response.js';

// ── Helpers ───────────────────────────────────────────────────

/** Lấy thông tin đầy đủ của danh sách product_id từ DB */
const hydrateProducts = (productIds) => {
  if (!productIds.length) return [];
  return Product.findAll({
    where: { pk_product_id: productIds, is_active: 1 },
    include: [{ model: ProductImage, as: 'images', where: { is_primary: 1 }, required: false }],
  }).then(products => {
    // Giữ đúng thứ tự score từ AI
    const map = Object.fromEntries(products.map(p => [p.pk_product_id, p]));
    return productIds.map(id => map[id]).filter(Boolean);
  });
};

/** Fallback: sản phẩm mới nhất khi AI không phản hồi */
const getTrending = () =>
  Product.findAll({
    where: { is_active: 1 },
    include: [{ model: ProductImage, as: 'images', where: { is_primary: 1 }, required: false }],
    order: [['created_at', 'DESC']],
    limit: 10,
  });

// ── Controllers ───────────────────────────────────────────────

/**
 * GET /api/v1/recommendations/homepage  [AUTH]
 * Gợi ý sản phẩm trang chủ qua collaborative filtering.
 */
export const getHomepage = async (req, res, next) => {
  try {
    const userId = req.user.pk_user_id;
    let products;

    try {
      const aiData = await fetchHomepageRecommendations(userId);
      const productIds = aiData.recommendations.map(r => r.product_id);
      products = await hydrateProducts(productIds);
      // Nếu AI trả về trending (user mới) mà không có gì trong DB → fallback
      if (!products.length) products = await getTrending();
    } catch {
      products = await getTrending();
    }

    return success(res, products);
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/recommendations/product/:productId  [OPT_AUTH]
 * Gợi ý sản phẩm mua kèm qua association rules.
 */
export const getForProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    let products;

    try {
      const aiData = await fetchProductRecommendations(productId);
      const productIds = aiData.recommendations.map(r => r.product_id);
      products = await hydrateProducts(productIds);
      if (!products.length) products = await getTrending();
    } catch {
      products = await getTrending();
    }

    return success(res, products);
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/recommendations/repurchase  [AUTH]
 * Nhắc mua lại sản phẩm tiêu hao sắp hết.
 * Query: ?days_ahead=7
 */
export const getRepurchaseReminders = async (req, res, next) => {
  try {
    const userId = req.user.pk_user_id;
    const daysAhead = parseInt(req.query.days_ahead) || 7;

    try {
      const aiData = await fetchRepurchaseReminders(userId, daysAhead);

      // Tạo thông báo cho các sản phẩm sắp cần mua lại (nếu chưa có)
      for (const reminder of aiData.reminders) {
        const exists = await Notification.findOne({
          where: {
            fk_user_id: userId,
            type: 'repurchase_reminder',
            ref_id: reminder.product_id,
          },
        });
        if (!exists) {
          await Notification.create({
            fk_user_id: userId,
            type: 'repurchase_reminder',
            title: 'Nhắc mua lại sản phẩm',
            message: `Sản phẩm "${reminder.product_name}" của bạn sắp hết, dự kiến cần mua lại vào ${reminder.predicted_date}.`,
            ref_id: reminder.product_id,
          });
        }
      }

      return success(res, aiData.reminders);
    } catch {
      return success(res, []);
    }
  } catch (err) { next(err); }
};
