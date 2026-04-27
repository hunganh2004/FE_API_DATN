import { Review, User, Product, Order, OrderItem } from '../models/index.js';
import { success, created, paginated, error } from '../utils/response.js';

export const getByProduct = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { count, rows } = await Review.findAndCountAll({
      where: { fk_product_id: req.params.productId, fk_parent_id: null },
      include: [
        { model: User, as: 'user', attributes: ['pk_user_id', 'full_name', 'avatar_url'] },
        { model: Review, as: 'replies', include: [{ model: User, as: 'user', attributes: ['pk_user_id', 'full_name', 'avatar_url'] }] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
    return paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const { rating, comment, fk_parent_id } = req.body;
    const product = await Product.findByPk(req.params.productId);
    if (!product) return error(res, 'Sản phẩm không tồn tại', 404);

    // Reply không cần verified purchase, chỉ review gốc mới cần
    if (!fk_parent_id) {
      const purchased = await OrderItem.findOne({
        where: { fk_product_id: req.params.productId },
        include: [{
          model: Order, as: 'order',
          where: { fk_user_id: req.user.pk_user_id, order_status: 'delivered' },
          required: true,
        }],
      });
      if (!purchased) return error(res, 'Bạn cần mua và nhận sản phẩm này trước khi đánh giá', 403);
    }

    const review = await Review.create({
      fk_product_id: req.params.productId,
      fk_user_id: req.user.pk_user_id,
      rating: fk_parent_id ? null : rating,
      comment,
      fk_parent_id: fk_parent_id || null,
    });
    return created(res, review);
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return error(res, 'Đánh giá không tồn tại', 404);
    if (review.fk_user_id !== req.user.pk_user_id && req.user.role !== 'admin') {
      return error(res, 'Không có quyền xoá đánh giá này', 403);
    }
    // Nếu là review gốc thì xóa luôn toàn bộ replies
    if (!review.fk_parent_id) {
      await Review.destroy({ where: { fk_parent_id: review.pk_review_id } });
    }
    await review.destroy();
    return success(res, null, 'Xoá đánh giá thành công');
  } catch (err) { next(err); }
};
