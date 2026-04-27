import { PetType } from '../models/index.js';
import { success, created, error } from '../utils/response.js';

export const getAll = async (req, res, next) => {
  try {
    return success(res, await PetType.findAll());
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const type = await PetType.create(req.body);
    return created(res, type);
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const type = await PetType.findByPk(req.params.id);
    if (!type) return error(res, 'Loại thú cưng không tồn tại', 404);
    await type.update(req.body);
    return success(res, type);
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    const type = await PetType.findByPk(req.params.id);
    if (!type) return error(res, 'Loại thú cưng không tồn tại', 404);
    await type.destroy();
    return success(res, null, 'Xoá thành công');
  } catch (err) { next(err); }
};
