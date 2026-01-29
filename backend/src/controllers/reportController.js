import reportService from '../services/reportService.js';

export const getBillReport = async (req, res) => {
    try {
        const { startDate, endDate, txnType, orderType, sort } = req.query;

        const filters = {
            txnType: txnType ? txnType.split(',') : ['all'],
            orderType: orderType ? orderType.split(',') : ['all'],
            sort
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
        const { startDate, endDate } = req.query;
        const result = await reportService.getItemReport(startDate, endDate);
        res.json(result);
    } catch (error) {
        console.error("Error fetching item report:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

export default {
    getBillReport,
    getItemReport
};
