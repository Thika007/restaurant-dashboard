import historyService from '../services/historyService.js';

export const getHistory = async (req, res) => {
    try {
        const { startDate, endDate, locationId: queryLocId } = req.query;
        const isAdmin = req.user.supervisor === 'Y' || req.user.alowmaster === 'Y';
        const locationId = (isAdmin && queryLocId) ? queryLocId : req.user.locationId;
        const history = await historyService.getHistory(startDate, endDate, locationId);
        res.json(history);
    } catch (error) {
        console.error("History Controller Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getHistoryStats = async (req, res) => {
    try {
        const { startDate, endDate, locationId: queryLocId } = req.query;
        const isAdmin = req.user.supervisor === 'Y' || req.user.alowmaster === 'Y';
        const locationId = (isAdmin && queryLocId) ? queryLocId : req.user.locationId;
        const stats = await historyService.getHistoryStats(startDate, endDate, locationId);
        res.json(stats);
    } catch (error) {
        console.error("History Stats Controller Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getHistorySalesTrend = async (req, res) => {
    try {
        const { startDate, endDate, locationId: queryLocId } = req.query;
        const isAdmin = req.user.supervisor === 'Y' || req.user.alowmaster === 'Y';
        const locationId = (isAdmin && queryLocId) ? queryLocId : req.user.locationId;
        const trend = await historyService.getHistorySalesTrend(startDate, endDate, locationId);
        res.json(trend);
    } catch (error) {
        console.error("History Trend Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getHistoryTopItems = async (req, res) => {
    try {
        const { startDate, endDate, locationId: queryLocId } = req.query;
        const isAdmin = req.user.supervisor === 'Y' || req.user.alowmaster === 'Y';
        const locationId = (isAdmin && queryLocId) ? queryLocId : req.user.locationId;
        const items = await historyService.getHistoryTopItems(startDate, endDate, locationId);
        res.json(items);
    } catch (error) {
        console.error("History Top Items Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getHistoryOrderTypes = async (req, res) => {
    try {
        const { startDate, endDate, locationId: queryLocId } = req.query;
        const isAdmin = req.user.supervisor === 'Y' || req.user.alowmaster === 'Y';
        const locationId = (isAdmin && queryLocId) ? queryLocId : req.user.locationId;
        const types = await historyService.getHistoryOrderTypes(startDate, endDate, locationId);
        res.json(types);
    } catch (error) {
        console.error("History Order Types Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getHistoryPaymentMethods = async (req, res) => {
    try {
        const { startDate, endDate, locationId: queryLocId } = req.query;
        const isAdmin = req.user.supervisor === 'Y' || req.user.alowmaster === 'Y';
        const locationId = (isAdmin && queryLocId) ? queryLocId : req.user.locationId;
        const methods = await historyService.getHistoryPaymentMethods(startDate, endDate, locationId);
        res.json(methods);
    } catch (error) {
        console.error("History Payment Methods Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export default {
    getHistory,
    getHistoryStats,
    getHistorySalesTrend,
    getHistoryTopItems,
    getHistoryOrderTypes,
    getHistoryPaymentMethods
};
