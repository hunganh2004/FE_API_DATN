import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware.js';
import * as petTypeController from '../controllers/petType.controller.js';

const router = Router();

router.get('/', petTypeController.getAll);
router.post('/', authenticate, authorizeAdmin, petTypeController.create);
router.put('/:id', authenticate, authorizeAdmin, petTypeController.update);
router.delete('/:id', authenticate, authorizeAdmin, petTypeController.remove);

export default router;
