import express from 'express';
import chartsController from '../controllers/chartsController.js';

const router = express.Router();

router.get('/sales-trend', chartsController.getSalesTrend);
router.get('/top-items', chartsController.getTopItems);
router.get('/order-types', chartsController.getOrderTypes);
router.get('/payment-methods', chartsController.getPaymentMethods);

export default router;
