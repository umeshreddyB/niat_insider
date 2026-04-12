import { Router } from 'express';
import * as articleController from '../controllers/article.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authoriseArticleCampus } from '../middleware/authorise.js';

const router = Router();

router.get('/', authenticate, articleController.listArticles);
router.post('/', authenticate, articleController.createArticle);
router.get('/:articleId', authenticate, authoriseArticleCampus, articleController.getArticleById);
router.patch('/:articleId', authenticate, authoriseArticleCampus, articleController.updateArticle);
router.delete('/:articleId', authenticate, authoriseArticleCampus, articleController.deleteArticle);

export default router;
