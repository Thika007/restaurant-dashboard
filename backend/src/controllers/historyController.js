import historyService from '../services/historyService.js';

export const getHistory = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const history = await historyService.getHistory(startDate, endDate);
        res.json(history);
    } catch (error) {
        console.error("History Controller Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getHistoryStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const stats = await historyService.getHistoryStats(startDate, endDate);
        res.json(stats);
    } catch (error) {
        console.error("History Stats Controller Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getHistorySalesTrend = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const trend = await historyService.getHistorySalesTrend(startDate, endDate);
        res.json(trend);
    } catch (error) {
        console.error("History Trend Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getHistoryTopItems = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const items = await historyService.getHistoryTopItems(startDate, endDate);
        res.json(items);
    } catch (error) {
        console.error("History Top Items Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getHistoryOrderTypes = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const types = await historyService.getHistoryOrderTypes(startDate, endDate);
        res.json(types);
    } catch (error) {
        console.error("History Order Types Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getHistoryPaymentMethods = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const methods = await historyService.getHistoryPaymentMethods(startDate, endDate);
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
