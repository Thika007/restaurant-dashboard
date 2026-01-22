import chartsService from '../services/chartsService.js';

export const getSalesTrend = async (req, res) => {
    try {
        const trend = await chartsService.getSalesTrend();
        res.json(trend);
    } catch (error) {
        console.error("Sales Trend Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getTopItems = async (req, res) => {
    try {
        const items = await chartsService.getTopItems();
        res.json(items);
    } catch (error) {
        console.error("Top Items Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getOrderTypes = async (req, res) => {
    try {
        const types = await chartsService.getOrderTypes();
        res.json(types);
    } catch (error) {
        console.error("Order Types Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export default {
    getSalesTrend,
    getTopItems,
    getOrderTypes
};
