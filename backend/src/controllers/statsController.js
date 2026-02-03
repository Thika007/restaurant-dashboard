import statsService from '../services/statsService.js';

export const getTodayStats = async (req, res) => {
    try {
        const isAdmin = req.user.supervisor === 'Y' || req.user.alowmaster === 'Y';
        const locationId = (isAdmin && req.query.locationId) ? req.query.locationId : req.user.locationId;

        const stats = await statsService.getTodayStats(locationId);
        res.json(stats);
    } catch (error) {
        console.error("Stats Controller Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export default {
    getTodayStats
};
