import { getConnection } from '../config/db.js';
import sql from 'mssql';

export const getSalesTrend = async () => {
    const pool = await getConnection();
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.request()
        .input('today', sql.Date, today)
        .query(`
            SELECT 
                SUBSTRING(bill_start_time, 1, 2) as hour,
                SUM(bill_amt) as revenue
            FROM bill_header
            WHERE CAST(bill_date AS DATE) = @today AND bill_valid != 'X'
            GROUP BY SUBSTRING(bill_start_time, 1, 2)
            ORDER BY hour
        `);

    return result.recordset;
};

export const getTopItems = async () => {
    const pool = await getConnection();

    const result = await pool.request()
        .query(`
            SELECT TOP 3
                t.tran_desc as name,
                SUM(t.tran_qty) as quantity
            FROM bill_tran t
            INNER JOIN bill_header h ON t.bill_no = h.bill_no
            WHERE h.bill_valid != 'X' AND t.tran_type = 'S'
            GROUP BY t.tran_desc
            ORDER BY quantity DESC
        `);

    return result.recordset;
};

export const getOrderTypes = async () => {
    const pool = await getConnection();

    const result = await pool.request()
        .query(`
            SELECT 
                CASE 
                    WHEN Ord_Type = 'TO' THEN 'Table Order'
                    WHEN Ord_Type = 'TA' THEN 'Take Away'
                    WHEN Ord_Type = 'DE' THEN 'Delivery'
                    WHEN Ord_Type = 'QS' THEN 'Quick Service'
                    WHEN Ord_Type = 'CO' THEN 'Complimentary'
                    ELSE Ord_Type 
                END as type,
                COUNT(*) as count
            FROM bill_header
            WHERE bill_valid != 'X'
            GROUP BY Ord_Type
        `);

    return result.recordset;
};

export const getPaymentMethods = async () => {
    const pool = await getConnection();
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.request()
        .input('today', sql.Date, today)
        .query(`
            SELECT 
                CASE 
                    WHEN type_code = 'MM' THEN 'Cash'
                    WHEN type_code = 'CC' THEN 'Card'
                    WHEN type_code = 'CS' THEN 'Credit'
                    WHEN type_code = 'CO' THEN 'Complimentary'
                    WHEN type_code = 'ST' THEN 'Staff'
                    ELSE type_code
                END as name,
                COUNT(*) as value
            FROM bill_tran t
            INNER JOIN bill_header h ON t.bill_no = h.bill_no
            WHERE h.bill_valid != 'X' 
              AND CAST(h.bill_date AS DATE) = @today
              AND t.type_code IN ('MM', 'CC', 'CS', 'CO', 'ST')
            GROUP BY type_code
        `);

    return result.recordset;
};

export default {
    getSalesTrend,
    getTopItems,
    getOrderTypes,
    getPaymentMethods
};
