import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as wishlistController from '../controllers/wishlist.controller.js';

const router = Router();

router.get('/', authenticate, wishlistController.getWishlist);
router.post('/:productId', authenticate, wishlistController.addToWishlist);
router.delete('/:productId', authenticate, wishlistController.removeFromWishlist);

export default router;
