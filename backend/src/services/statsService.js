import { getConnection } from '../config/db.js';
import sql from 'mssql';

export const getTodayStats = async () => {
    const pool = await getConnection();
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.request()
        .input('today', sql.Date, today)
        .query(`
            SELECT 
                ISNULL(SUM(bill_amt), 0) as total_revenue,
                COUNT(bill_no) as bill_count,
                COUNT(CASE WHEN status = 'V' OR bill_valid = 'V' THEN 1 END) as cancelled_count
            FROM bill_header
            WHERE CAST(bill_date AS DATE) = @today
        `);

    return result.recordset[0];
};

export default {
    getTodayStats
};
