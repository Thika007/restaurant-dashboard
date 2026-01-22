import express from 'express';
import statsController from '../controllers/statsController.js';

const router = express.Router();

router.get('/today', statsController.getTodayStats);

export default router;
