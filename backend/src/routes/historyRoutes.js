import express from 'express';
import historyController from '../controllers/historyController.js';

const router = express.Router();

router.get('/', historyController.getHistory);
router.get('/stats', historyController.getHistoryStats);
router.get('/trend', historyController.getHistorySalesTrend);
router.get('/top-items', historyController.getHistoryTopItems);
router.get('/order-types', historyController.getHistoryOrderTypes);

export default router;
