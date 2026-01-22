import statsService from '../services/statsService.js';

export const getTodayStats = async (req, res) => {
    try {
        const stats = await statsService.getTodayStats();
        res.json(stats);
    } catch (error) {
        console.error("Stats Controller Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export default {
    getTodayStats
};
