import express from 'express';
import { login, getLocationIds } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/locations', protect, getLocationIds);

export default router;
