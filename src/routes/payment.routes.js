import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as paymentController from '../controllers/payment.controller.js';

const router = Router();

// Tạo URL thanh toán VNPay (cần đăng nhập)
router.post('/vnpay/create', authenticate, paymentController.createVNPayPayment);

// VNPay redirect về sau khi thanh toán (không cần auth — VNPay gọi trực tiếp)
router.get('/vnpay/callback', paymentController.vnpayCallback);

// VNPay IPN — server-to-server notification (không cần auth)
router.get('/vnpay/ipn', paymentController.vnpayIPN);

// MoMo callback (placeholder)
router.post('/callback/momo', paymentController.momoCallback);

export default router;
