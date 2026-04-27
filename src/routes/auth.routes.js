import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/register',
  [
    body('full_name').notEmpty().withMessage('Họ tên không được để trống'),
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),
  ],
  validate,
  authController.register
);

router.post('/login',
  [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
  ],
  validate,
  authController.login
);

router.get('/me', authenticate, authController.getMe);

router.post('/change-password',
  authenticate,
  [
    body('old_password').notEmpty().withMessage('Mật khẩu cũ không được để trống'),
    body('new_password').isLength({ min: 6 }).withMessage('Mật khẩu mới tối thiểu 6 ký tự'),
  ],
  validate,
  authController.changePassword
);

export default router;
