import { getConnection } from '../config/db.js';
import sql from 'mssql';

export const getTodayStats = async () => {
    const pool = await getConnection();
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.request()
        .input('today', sql.Date, today)
        .query(`
            SELECT 
                ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN bill_amt ELSE 0 END), 0) as total_revenue,
                ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN Service_charge_Amt ELSE 0 END), 0) as total_service_charge,
                COUNT(CASE WHEN bill_valid != 'X' THEN bill_no END) as bill_count,
                COUNT(CASE WHEN bill_valid = 'X' THEN 1 END) as cancelled_count,
                ISNULL(SUM(CASE WHEN Ord_Type = 'TO' AND bill_valid != 'X' THEN No_Of_Pax ELSE 0 END), 0) as guest_count
            FROM bill_header
            WHERE CAST(bill_date AS DATE) = @today
        `);

    return result.recordset[0];
};

export default {
    getTodayStats
};
