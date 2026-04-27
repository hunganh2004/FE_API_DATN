import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as cartController from '../controllers/cart.controller.js';

const router = Router();

router.get('/', authenticate, cartController.getCart);
router.post('/', authenticate, cartController.addItem);
router.put('/:itemId', authenticate, cartController.updateItem);
router.delete('/:itemId', authenticate, cartController.removeItem);
router.delete('/', authenticate, cartController.clearCart);

export default router;
