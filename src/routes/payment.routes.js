import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';

const router = Router();

router.post('/callback/momo', paymentController.momoCallback);
router.post('/callback/vnpay', paymentController.vnpayCallback);

export default router;
