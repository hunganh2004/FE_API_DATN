import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware.js';
import * as categoryController from '../controllers/category.controller.js';

const router = Router();

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', authenticate, authorizeAdmin, categoryController.create);
router.put('/:id', authenticate, authorizeAdmin, categoryController.update);
router.delete('/:id', authenticate, authorizeAdmin, categoryController.remove);

export default router;
