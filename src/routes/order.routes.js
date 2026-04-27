import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as orderController from '../controllers/order.controller.js';

const router = Router();

router.get('/', authenticate, orderController.getMyOrders);
router.get('/:id', authenticate, orderController.getOrderDetail);
router.post('/', authenticate, orderController.createOrder);
router.patch('/:id/cancel', authenticate, orderController.cancelOrder);

export default router;
