import reportService from '../services/reportService.js';

export const getBillReport = async (req, res) => {
    try {
        const { startDate, endDate, txnType, orderType, sort } = req.query;

        const isAdmin = req.user.supervisor === 'Y' || req.user.alowmaster === 'Y';
        const locationId = (isAdmin && req.query.locationId) ? req.query.locationId : req.user.locationId;

        const filters = {
            txnType: txnType ? txnType.split(',') : ['all'],
            orderType: orderType ? orderType.split(',') : ['all'],
            sort,
            locationId
        };

        const result = await reportService.getBillReport(startDate, endDate, filters);
        res.json(result);
    } catch (error) {
        console.error("Error fetching bill report:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

export const getItemReport = async (req, res) => {
    try {
        const { startDate, endDate, txnType, orderType, categories, subCategories, itemName, descSort, qtySort, amtSort } = req.query;

        const isAdmin = req.user.supervisor === 'Y' || req.user.alowmaster === 'Y';
        const locationId = (isAdmin && req.query.locationId) ? req.query.locationId : req.user.locationId;

        const filters = {
            txnType: txnType ? txnType.split(',') : ['all'],
            orderType: orderType ? orderType.split(',') : ['all'],
            categories: categories ? categories.split(',') : ['all'],
            subCategories: subCategories ? subCategories.split(',') : ['all'],
            itemName,
            descSort,
            qtySort,
            amtSort,
            locationId
        };

        const result = await reportService.getItemReport(startDate, endDate, filters);
        res.json(result);
    } catch (error) {
        console.error("Error fetching item report:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

export const getCategories = async (req, res) => {
    try {
        const result = await reportService.getCategories();
        res.json(result);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

export const getSubCategories = async (req, res) => {
    try {
        const { deptCode } = req.query;
        const result = await reportService.getSubCategories(deptCode);
        res.json(result);
    } catch (error) {
        console.error("Error fetching sub-categories:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

export const getCardTypes = async (req, res) => {
    try {
        const result = await reportService.getCardTypes();
        res.json(result);
    } catch (error) {
        console.error("Error fetching card types:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

export default {
    getBillReport,
    getItemReport,
    getCategories,
    getSubCategories,
    getCardTypes
};
