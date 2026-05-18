import { Router } from 'express';
import { chat } from '../controllers/chat.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/v1/chat — auth tùy chọn (có token thì retrieve đơn hàng của user)
router.post('/', optionalAuth, chat);

export default router;
