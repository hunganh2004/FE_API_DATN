import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';
import { User } from '../models/index.js';
import { success, created, error } from '../utils/response.js';

const toPublicUser = (user) => ({
  id: user.pk_user_id,
  full_name: user.full_name,
  email: user.email,
  phone: user.phone,
  avatar_url: user.avatar_url,
  role: user.role,
});

export const register = async (req, res, next) => {
  try {
    const { full_name, email, password, phone } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return error(res, 'Email đã được sử dụng', 409);

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ full_name, email, password_hash, phone });
    const token = jwt.sign({ id: user.pk_user_id, role: user.role }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

    return created(res, { token, user: toPublicUser(user) }, 'Đăng ký thành công');
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return error(res, 'Email không tồn tại', 404);
    if (!user.is_active) return error(res, 'Tài khoản đã bị khoá', 403);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return error(res, 'Mật khẩu không đúng', 401);

    const token = jwt.sign({ id: user.pk_user_id, role: user.role }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

    return success(res, { token, user: toPublicUser(user) }, 'Đăng nhập thành công');
  } catch (err) { next(err); }
};

export const getMe = (req, res) => success(res, toPublicUser(req.user));

export const changePassword = async (req, res, next) => {
  try {
    const { old_password, new_password } = req.body;
    const user = req.user;

    const valid = await bcrypt.compare(old_password, user.password_hash);
    if (!valid) return error(res, 'Mật khẩu cũ không đúng', 400);

    user.password_hash = await bcrypt.hash(new_password, 10);
    await user.save();

    return success(res, null, 'Đổi mật khẩu thành công');
  } catch (err) { next(err); }
};
