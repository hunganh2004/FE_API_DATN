import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as reviewController from '../controllers/review.controller.js';

const router = Router();

router.get('/product/:productId', reviewController.getByProduct);
router.post('/product/:productId', authenticate, reviewController.create);
router.delete('/:id', authenticate, reviewController.remove);

export default router;
