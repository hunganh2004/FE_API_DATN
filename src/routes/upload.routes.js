import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { uploadOne, uploadMany } from '../controllers/upload.controller.js';

const router = Router();

router.post('/', authenticate, uploadOne);
router.post('/multiple', authenticate, uploadMany);

export default router;
