import { Router } from 'express';
import * as metaController from '../controllers/meta.controller.js';

const router = Router();

router.get('/campuses', metaController.listCampuses);

export default router;
