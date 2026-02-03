import chartsService from '../services/chartsService.js';

export const getSalesTrend = async (req, res) => {
    try {
        const isAdmin = req.user.supervisor === 'Y' || req.user.alowmaster === 'Y';
        const locationId = (isAdmin && req.query.locationId) ? req.query.locationId : req.user.locationId;
        const trend = await chartsService.getSalesTrend(locationId);
        res.json(trend);
    } catch (error) {
        console.error("Sales Trend Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getTopItems = async (req, res) => {
    try {
        const isAdmin = req.user.supervisor === 'Y' || req.user.alowmaster === 'Y';
        const locationId = (isAdmin && req.query.locationId) ? req.query.locationId : req.user.locationId;
        const items = await chartsService.getTopItems(locationId);
        res.json(items);
    } catch (error) {
        console.error("Top Items Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getOrderTypes = async (req, res) => {
    try {
        const isAdmin = req.user.supervisor === 'Y' || req.user.alowmaster === 'Y';
        const locationId = (isAdmin && req.query.locationId) ? req.query.locationId : req.user.locationId;
        const types = await chartsService.getOrderTypes(locationId);
        res.json(types);
    } catch (error) {
        console.error("Order Types Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getPaymentMethods = async (req, res) => {
    try {
        const isAdmin = req.user.supervisor === 'Y' || req.user.alowmaster === 'Y';
        const locationId = (isAdmin && req.query.locationId) ? req.query.locationId : req.user.locationId;
        const methods = await chartsService.getPaymentMethods(locationId);
        res.json(methods);
    } catch (error) {
        console.error("Payment Methods Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export default {
    getSalesTrend,
    getTopItems,
    getOrderTypes,
    getPaymentMethods
};
