import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import statsRoutes from './routes/statsRoutes.js';
import chartsRoutes from './routes/chartsRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/stats', statsRoutes);
app.use('/api/charts', chartsRoutes);
app.use('/api/history', historyRoutes);

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
