import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderDetail);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetail);
router.patch('/users/:id/toggle-active', adminController.toggleUserActive);

router.get('/payments', adminController.getPayments);

router.get('/reviews', adminController.getReviews);
router.delete('/reviews/:id', adminController.deleteReview);
router.post('/reviews/:id/reply', adminController.replyReview);

router.get('/stats/revenue', adminController.getRevenue);
router.get('/stats/top-products', adminController.getTopProducts);
router.get('/stats/customer-segments', adminController.getCustomerSegments);
router.get('/stats/behavior', adminController.getBehaviorStats);

router.get('/ai/health',          adminController.getAIHealth);
router.post('/ai/train/all',      adminController.trainAllModels);
router.post('/ai/train/:model',   adminController.trainSingleModel);

router.get('/notifications',      adminController.getNotifications);
router.post('/notifications',     adminController.sendNotification);
router.delete('/notifications/:id', adminController.deleteNotification);

export default router;
