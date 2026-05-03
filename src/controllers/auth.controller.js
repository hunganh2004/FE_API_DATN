import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';
import { User } from '../models/index.js';
import { success, created, error } from '../utils/response.js';
import {
  sendWelcome,
  sendPasswordChanged,
  sendResetPassword,
} from '../utils/mailer.js';

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

    // Gửi email chào mừng (không block response nếu lỗi)
    sendWelcome(email, full_name).catch(() => {});

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

    sendPasswordChanged(user.email, user.full_name).catch(() => {});

    return success(res, null, 'Đổi mật khẩu thành công');
  } catch (err) { next(err); }
};

// POST /auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Luôn trả 200 để tránh leak thông tin email tồn tại hay không
    if (!user) return success(res, null, 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu');

    const token = jwt.sign(
      { id: user.pk_user_id, purpose: 'reset_password' },
      jwtConfig.secret,
      { expiresIn: '15m' }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    sendResetPassword(email, user.full_name, resetUrl).catch(() => {});

    return success(res, null, 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu');
  } catch (err) { next(err); }
};

// POST /auth/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, new_password } = req.body;

    let payload;
    try {
      payload = jwt.verify(token, jwtConfig.secret);
    } catch {
      return error(res, 'Token không hợp lệ hoặc đã hết hạn', 400);
    }

    if (payload.purpose !== 'reset_password') {
      return error(res, 'Token không hợp lệ', 400);
    }

    const user = await User.findByPk(payload.id);
    if (!user) return error(res, 'Người dùng không tồn tại', 404);

    user.password_hash = await bcrypt.hash(new_password, 10);
    await user.save();

    sendPasswordChanged(user.email, user.full_name).catch(() => {});

    return success(res, null, 'Đặt lại mật khẩu thành công');
  } catch (err) { next(err); }
};
