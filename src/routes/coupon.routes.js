import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware.js';
import * as couponController from '../controllers/coupon.controller.js';

const router = Router();

router.post('/validate', authenticate, couponController.validate);
router.get('/', authenticate, authorizeAdmin, couponController.getAll);
router.post('/', authenticate, authorizeAdmin, couponController.create);
router.put('/:id', authenticate, authorizeAdmin, couponController.update);
router.delete('/:id', authenticate, authorizeAdmin, couponController.remove);

export default router;
