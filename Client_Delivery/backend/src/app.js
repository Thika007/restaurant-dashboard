import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import statsRoutes from './routes/statsRoutes.js';
import chartsRoutes from './routes/chartsRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { protect } from './middleware/authMiddleware.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/stats', protect, statsRoutes);
app.use('/api/charts', protect, chartsRoutes);
app.use('/api/history', protect, historyRoutes);
app.use('/api/reports', protect, reportRoutes);

// Serve Static Frontend Files
const distPath = path.join(__dirname, '../../dist');
const deliveryPath = path.join(__dirname, '../../Client_Delivery/dist');

// Use dist if exists, otherwise try delivery path
app.use(express.static(distPath));
app.use(express.static(deliveryPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return next();

    // Check which path to serve index.html from
    const indexPathDev = path.join(distPath, 'index.html');
    res.sendFile(indexPathDev);
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global Error:", err);
    res.status(500).json({
        message: "Internal Server Error",
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

export default app;
