import { Router } from 'express';
import * as articleController from '../controllers/article.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authoriseArticleCampus } from '../middleware/authorise.js';

const router = Router();

router.get('/', authenticate, articleController.listArticles);
router.post('/', authenticate, articleController.createArticle);
router.get('/:id', authenticate, authoriseArticleCampus, articleController.getArticleById);
router.put('/:id', authenticate, authoriseArticleCampus, articleController.updateArticle);
router.delete('/:id', authenticate, authoriseArticleCampus, articleController.deleteArticle);

export default router;
