import { CartItem, Product, ProductVariant, ProductImage } from '../models/index.js';
import { success, error } from '../utils/response.js';

export const getCart = async (req, res, next) => {
  try {
    const items = await CartItem.findAll({
      where: { fk_user_id: req.user.pk_user_id },
      include: [
        { model: Product, as: 'product', include: [{ model: ProductImage, as: 'images', where: { is_primary: 1 }, required: false }] },
        { model: ProductVariant, as: 'variant' },
      ],
    });
    return success(res, items);
  } catch (err) { next(err); }
};

export const addItem = async (req, res, next) => {
  try {
    const { product_id, variant_id, quantity = 1 } = req.body;
    const userId = req.user.pk_user_id;

    const product = await Product.findByPk(product_id);
    if (!product?.is_active) return error(res, 'Sản phẩm không tồn tại', 404);

    const stockSource = variant_id ? await ProductVariant.findByPk(variant_id) : product;
    if (!stockSource || stockSource.stock < quantity) return error(res, 'Sản phẩm không đủ hàng', 400);

    const [item, isNew] = await CartItem.findOrCreate({
      where: { fk_user_id: userId, fk_product_id: product_id, fk_variant_id: variant_id || null },
      defaults: { quantity },
    });

    if (!isNew) { item.quantity += quantity; await item.save(); }

    return success(res, item, 'Thêm vào giỏ hàng thành công', isNew ? 201 : 200);
  } catch (err) { next(err); }
};

export const updateItem = async (req, res, next) => {
  try {
    const item = await CartItem.findOne({ where: { pk_cart_item_id: req.params.itemId, fk_user_id: req.user.pk_user_id } });
    if (!item) return error(res, 'Sản phẩm không có trong giỏ hàng', 404);
    const { quantity } = req.body;
    if (quantity <= 0) { await item.destroy(); return success(res, null, 'Đã xoá sản phẩm khỏi giỏ hàng'); }
    item.quantity = quantity;
    await item.save();
    return success(res, item);
  } catch (err) { next(err); }
};

export const removeItem = async (req, res, next) => {
  try {
    const item = await CartItem.findOne({ where: { pk_cart_item_id: req.params.itemId, fk_user_id: req.user.pk_user_id } });
    if (!item) return error(res, 'Sản phẩm không có trong giỏ hàng', 404);
    await item.destroy();
    return success(res, null, 'Đã xoá sản phẩm khỏi giỏ hàng');
  } catch (err) { next(err); }
};

export const clearCart = async (req, res, next) => {
  try {
    await CartItem.destroy({ where: { fk_user_id: req.user.pk_user_id } });
    return success(res, null, 'Đã xoá toàn bộ giỏ hàng');
  } catch (err) { next(err); }
};
