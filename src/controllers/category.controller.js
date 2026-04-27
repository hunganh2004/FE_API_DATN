import { Category } from '../models/index.js';
import { success, created, error } from '../utils/response.js';
import { createSlug } from '../utils/slugify.js';

export const getAll = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: 1, fk_parent_id: null },
      include: [{ model: Category, as: 'children', where: { is_active: 1 }, required: false }],
      order: [['sort_order', 'ASC']],
    });
    return success(res, categories);
  } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
  try {
    const cat = await Category.findByPk(req.params.id, {
      include: [{ model: Category, as: 'children' }],
    });
    if (!cat) return error(res, 'Danh mục không tồn tại', 404);
    return success(res, cat);
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const { name, fk_parent_id, description, image_url, sort_order } = req.body;
    const cat = await Category.create({ name, slug: createSlug(name), fk_parent_id, description, image_url, sort_order });
    return created(res, cat);
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return error(res, 'Danh mục không tồn tại', 404);
    const { name, description, image_url, sort_order, is_active } = req.body;
    if (name) { cat.name = name; cat.slug = createSlug(name); }
    if (description !== undefined) cat.description = description;
    if (image_url !== undefined) cat.image_url = image_url;
    if (sort_order !== undefined) cat.sort_order = sort_order;
    if (is_active !== undefined) cat.is_active = is_active;
    await cat.save();
    return success(res, cat);
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return error(res, 'Danh mục không tồn tại', 404);
    const productCount = await cat.countProducts();
    if (productCount > 0) return error(res, 'Không thể xoá danh mục còn chứa sản phẩm', 400);
    await cat.destroy();
    return success(res, null, 'Xoá danh mục thành công');
  } catch (err) { next(err); }
};
