import { Router } from 'express';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import * as behaviorController from '../controllers/behavior.controller.js';

const router = Router();

router.post('/', optionalAuth, behaviorController.log);

export default router;
