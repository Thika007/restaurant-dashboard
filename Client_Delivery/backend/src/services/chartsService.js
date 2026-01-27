import { getConnection } from '../config/db.js';
import sql from 'mssql';

export const getSalesTrend = async (locationId) => {
    const pool = await getConnection();
    const today = new Date().toISOString().split('T')[0];

    const request = pool.request()
        .input('today', sql.Date, today);

    let query = `
        SELECT 
            SUBSTRING(bill_start_time, 1, 2) as hour,
            SUM(bill_amt) as revenue
        FROM bill_header
        WHERE CAST(bill_date AS DATE) = @today AND bill_valid != 'X'
    `;

    if (locationId && String(locationId).trim() !== '000') {
        const trimmedLocId = String(locationId).trim();
        query += ` AND LTRIM(RTRIM(loc_id)) = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

    query += `
        GROUP BY SUBSTRING(bill_start_time, 1, 2)
        ORDER BY hour
    `;

    const result = await request.query(query);
    return result.recordset;
};

export const getTopItems = async (locationId) => {
    const pool = await getConnection();
    const request = pool.request();

    let query = `
        SELECT TOP 3
            t.tran_desc as name,
            SUM(t.tran_qty) as quantity
        FROM bill_tran t
        INNER JOIN bill_header h ON t.bill_no = h.bill_no
        WHERE h.bill_valid != 'X' AND t.tran_type = 'S'
    `;

    if (locationId && String(locationId).trim() !== '000') {
        const trimmedLocId = String(locationId).trim();
        query += ` AND LTRIM(RTRIM(h.loc_id)) = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

    query += `
        GROUP BY t.tran_desc
        ORDER BY quantity DESC
    `;

    const result = await request.query(query);
    return result.recordset;
};

export const getOrderTypes = async (locationId) => {
    const pool = await getConnection();
    const request = pool.request();

    let query = `
        SELECT 
            CASE 
                WHEN Ord_Type = 'TO' THEN 'Table Order'
                WHEN Ord_Type = 'TA' THEN 'Take Away'
                WHEN Ord_Type = 'DE' THEN 'Delivery'
                WHEN Ord_Type = 'QS' THEN 'Quick Service'
            END as type,
            COUNT(*) as count
        FROM bill_header
        WHERE bill_valid != 'X' AND Ord_Type IN ('DE', 'QS', 'TO', 'TA')
    `;

    if (locationId && String(locationId).trim() !== '000') {
        const trimmedLocId = String(locationId).trim();
        query += ` AND LTRIM(RTRIM(loc_id)) = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

    query += ` GROUP BY Ord_Type`;

    const result = await request.query(query);
    return result.recordset;
};

export const getPaymentMethods = async (locationId) => {
    const pool = await getConnection();
    const today = new Date().toISOString().split('T')[0];

    const request = pool.request()
        .input('today', sql.Date, today);

    let query = `
        SELECT 
            CASE 
                WHEN type_code = 'MM' THEN 'Cash'
                WHEN type_code = 'CC' THEN 'Card'
            END as name,
            COUNT(*) as value
        FROM bill_tran t
        INNER JOIN bill_header h ON t.bill_no = h.bill_no
        WHERE h.bill_valid != 'X' 
          AND CAST(h.bill_date AS DATE) = @today
          AND t.type_code IN ('MM', 'CC')
    `;

    if (locationId && String(locationId).trim() !== '000') {
        const trimmedLocId = String(locationId).trim();
        query += ` AND LTRIM(RTRIM(h.loc_id)) = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

    query += ` GROUP BY type_code`;

    const result = await request.query(query);
    return result.recordset;
};

export default {
    getSalesTrend,
    getTopItems,
    getOrderTypes,
    getPaymentMethods
};
