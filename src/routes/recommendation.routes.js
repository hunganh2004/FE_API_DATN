import { Router } from 'express';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import * as recommendationController from '../controllers/recommendation.controller.js';

const router = Router();

router.get('/homepage',    authenticate, recommendationController.getHomepage);
router.get('/product/:productId', optionalAuth, recommendationController.getForProduct);
router.get('/repurchase',  authenticate, recommendationController.getRepurchaseReminders);

export default router;
