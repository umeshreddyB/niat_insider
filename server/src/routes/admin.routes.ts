import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/moderators', adminController.listModerators);
router.post('/moderators', adminController.createModerator);

export default router;
