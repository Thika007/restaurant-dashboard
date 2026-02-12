import express from 'express';
import reportController from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/bill', protect, reportController.getBillReport);
router.get('/item', protect, reportController.getItemReport);
router.get('/categories', protect, reportController.getCategories);
router.get('/subcategories', protect, reportController.getSubCategories);
router.get('/card-types', protect, reportController.getCardTypes);

export default router;
