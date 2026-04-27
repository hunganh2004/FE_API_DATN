import { UserBehaviorLog } from '../models/index.js';
import { success } from '../utils/response.js';

export const log = async (req, res, next) => {
  try {
    const { session_id, product_id, action, search_query, duration_sec } = req.body;
    await UserBehaviorLog.create({
      fk_user_id: req.user?.pk_user_id || null,
      session_id,
      fk_product_id: product_id || null,
      action,
      search_query: search_query || null,
      duration_sec: duration_sec || null,
    });
    return success(res, null, 'Ghi log thành công');
  } catch (err) { next(err); }
};
