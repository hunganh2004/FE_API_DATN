import { Router } from 'express';
import { authenticate, authorizeAdmin, optionalAuth } from '../middlewares/auth.middleware.js';
import * as productController from '../controllers/product.controller.js';

const router = Router();

router.get('/', optionalAuth, productController.getAll);
router.get('/:id', optionalAuth, productController.getById);
router.post('/', authenticate, authorizeAdmin, productController.create);
router.put('/:id', authenticate, authorizeAdmin, productController.update);
router.delete('/:id', authenticate, authorizeAdmin, productController.remove);

router.get('/:id/variants', productController.getVariants);
router.post('/:id/variants', authenticate, authorizeAdmin, productController.addVariant);
router.put('/:id/variants/:variantId', authenticate, authorizeAdmin, productController.updateVariant);
router.delete('/:id/variants/:variantId', authenticate, authorizeAdmin, productController.deleteVariant);

router.post('/:id/images', authenticate, authorizeAdmin, productController.addImage);
router.patch('/:id/images/:imageId/primary', authenticate, authorizeAdmin, productController.setPrimaryImage);
router.delete('/:id/images/:imageId', authenticate, authorizeAdmin, productController.deleteImage);

export default router;
