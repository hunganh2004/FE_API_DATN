import { Op } from 'sequelize';
import { Product, ProductVariant, ProductImage, ProductSpec, Category, PetType, Review, User } from '../models/index.js';
import { success, created, paginated, error } from '../utils/response.js';
import { createSlug } from '../utils/slugify.js';
import { deleteUploadedFile } from '../utils/fileHelper.js';

export const getAll = async (req, res, next) => {
  try {
    const { q, category_id, pet_type_id, price_min, price_max, stock_min, stock_max, in_stock, sort = 'created_at', order = 'DESC', page = 1, limit = 20 } = req.query;

    const where = { is_active: 1 };
    if (q) where.name = { [Op.like]: `%${q}%` };
    if (category_id) where.fk_category_id = category_id;
    if (price_min || price_max) {
      where.price = {};
      if (price_min) where.price[Op.gte] = price_min;
      if (price_max) where.price[Op.lte] = price_max;
    }
    if (in_stock === 'true') where.stock = { [Op.gt]: 0 };
    else if (in_stock === 'false') where.stock = 0;
    else if (stock_min || stock_max) {
      where.stock = {};
      if (stock_min) where.stock[Op.gte] = parseInt(stock_min);
      if (stock_max) where.stock[Op.lte] = parseInt(stock_max);
    }

    const include = [
      { model: ProductImage, as: 'images', where: { is_primary: 1 }, required: false },
      { model: Category, as: 'category', attributes: ['pk_category_id', 'name', 'slug'] },
    ];
    if (pet_type_id) include.push({ model: PetType, as: 'petTypes', where: { pk_pet_type_id: pet_type_id }, required: true });

    const { count, rows } = await Product.findAndCountAll({
      where, include,
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      distinct: true,
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { pk_product_id: req.params.id, is_active: 1 },
      include: [
        { model: ProductVariant, as: 'variants' },
        { model: ProductImage, as: 'images' },
        { model: ProductSpec, as: 'specs' },
        { model: Category, as: 'category' },
        { model: PetType, as: 'petTypes' },
        {
          model: Review, as: 'reviews', limit: 10,
          where: { fk_parent_id: null }, required: false,
          include: [{ model: User, as: 'user', attributes: ['pk_user_id', 'full_name', 'avatar_url'] }],
        },
      ],
    });
    if (!product) return error(res, 'Sản phẩm không tồn tại', 404);
    return success(res, product);
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const { name, pet_type_ids, ...rest } = req.body;
    const product = await Product.create({ ...rest, name, slug: createSlug(name) });
    if (pet_type_ids?.length) {
      const petTypes = await PetType.findAll({ where: { pk_pet_type_id: pet_type_ids } });
      await product.setPetTypes(petTypes);
    }
    return created(res, product);
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 'Sản phẩm không tồn tại', 404);
    const { name, pet_type_ids, ...rest } = req.body;
    if (name) { rest.name = name; rest.slug = createSlug(name); }
    await product.update(rest);
    if (pet_type_ids) {
      const petTypes = await PetType.findAll({ where: { pk_pet_type_id: pet_type_ids } });
      await product.setPetTypes(petTypes);
    }
    return success(res, product);
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 'Sản phẩm không tồn tại', 404);
    await product.update({ is_active: 0 });
    return success(res, null, 'Xoá sản phẩm thành công');
  } catch (err) { next(err); }
};

export const getVariants = async (req, res, next) => {
  try {
    return success(res, await ProductVariant.findAll({ where: { fk_product_id: req.params.id } }));
  } catch (err) { next(err); }
};

export const addVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.create({ fk_product_id: req.params.id, ...req.body });
    return created(res, variant);
  } catch (err) { next(err); }
};

export const updateVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findOne({ where: { pk_variant_id: req.params.variantId, fk_product_id: req.params.id } });
    if (!variant) return error(res, 'Biến thể không tồn tại', 404);
    await variant.update(req.body);
    return success(res, variant);
  } catch (err) { next(err); }
};

export const deleteVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findOne({ where: { pk_variant_id: req.params.variantId, fk_product_id: req.params.id } });
    if (!variant) return error(res, 'Biến thể không tồn tại', 404);
    await variant.destroy();
    return success(res, null, 'Xoá biến thể thành công');
  } catch (err) { next(err); }
};

export const addImage = async (req, res, next) => {
  try {
    const img = await ProductImage.create({ fk_product_id: req.params.id, ...req.body });
    return created(res, img);
  } catch (err) { next(err); }
};

export const setPrimaryImage = async (req, res, next) => {
  try {
    const img = await ProductImage.findOne({ where: { pk_image_id: req.params.imageId, fk_product_id: req.params.id } });
    if (!img) return error(res, 'Hình ảnh không tồn tại', 404);
    await ProductImage.update({ is_primary: 0 }, { where: { fk_product_id: req.params.id } });
    await img.update({ is_primary: 1 });
    return success(res, null, 'Đã đặt ảnh chính thành công');
  } catch (err) { next(err); }
};

export const deleteImage = async (req, res, next) => {
  try {
    const img = await ProductImage.findOne({ where: { pk_image_id: req.params.imageId, fk_product_id: req.params.id } });
    if (!img) return error(res, 'Hình ảnh không tồn tại', 404);
    deleteUploadedFile(img.image_url);
    await img.destroy();
    return success(res, null, 'Xoá hình ảnh thành công');
  } catch (err) { next(err); }
};
