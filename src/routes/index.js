import { Router } from 'express';
import authRoutes from './auth.routes.js';
import uploadRoutes from './upload.routes.js';
import userRoutes from './user.routes.js';
import categoryRoutes from './category.routes.js';
import petTypeRoutes from './petType.routes.js';
import productRoutes from './product.routes.js';
import reviewRoutes from './review.routes.js';
import cartRoutes from './cart.routes.js';
import couponRoutes from './coupon.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';
import behaviorRoutes from './behavior.routes.js';
import recommendationRoutes from './recommendation.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import notificationRoutes from './notification.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/auth',            authRoutes);
router.use('/upload',          uploadRoutes);
router.use('/users',           userRoutes);
router.use('/categories',      categoryRoutes);
router.use('/pet-types',       petTypeRoutes);
router.use('/products',        productRoutes);
router.use('/reviews',         reviewRoutes);
router.use('/cart',            cartRoutes);
router.use('/coupons',         couponRoutes);
router.use('/orders',          orderRoutes);
router.use('/payments',        paymentRoutes);
router.use('/behavior',        behaviorRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/wishlist',        wishlistRoutes);
router.use('/notifications',   notificationRoutes);
router.use('/admin',           adminRoutes);

export default router;
