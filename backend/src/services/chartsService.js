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
            WHERE CAST(bill_date AS DATE) = @today
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
                tran_desc as name,
                SUM(tran_qty) as quantity
            FROM bill_tran
            GROUP BY tran_desc
            ORDER BY quantity DESC
        `);

    return result.recordset;
};

export const getOrderTypes = async () => {
    const pool = await getConnection();

    const result = await pool.request()
        .query(`
            SELECT 
                Ord_Type as type,
                COUNT(*) as count
            FROM bill_header
            GROUP BY Ord_Type
        `);

    return result.recordset;
};

export default {
    getSalesTrend,
    getTopItems,
    getOrderTypes
};
