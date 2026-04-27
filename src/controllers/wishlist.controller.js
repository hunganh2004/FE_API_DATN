import { Wishlist, Product, ProductImage } from '../models/index.js';
import { success, error } from '../utils/response.js';

export const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.findAll({
      where: { fk_user_id: req.user.pk_user_id },
      include: [{ model: Product, as: 'product', include: [{ model: ProductImage, as: 'images', where: { is_primary: 1 }, required: false }] }],
      order: [['added_at', 'DESC']],
    });
    return success(res, items.map(i => i.product));
  } catch (err) { next(err); }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (!product) return error(res, 'Sản phẩm không tồn tại', 404);
    const [, isNew] = await Wishlist.findOrCreate({
      where: { fk_user_id: req.user.pk_user_id, fk_product_id: req.params.productId },
    });
    return success(res, null, isNew ? 'Đã thêm vào danh sách yêu thích' : 'Sản phẩm đã có trong danh sách', isNew ? 201 : 200);
  } catch (err) { next(err); }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const deleted = await Wishlist.destroy({ where: { fk_user_id: req.user.pk_user_id, fk_product_id: req.params.productId } });
    if (!deleted) return error(res, 'Sản phẩm không có trong danh sách yêu thích', 404);
    return success(res, null, 'Đã xoá khỏi danh sách yêu thích');
  } catch (err) { next(err); }
};
