import { getConnection } from '../config/db.js';
import sql from 'mssql';

export const getHistory = async (startDate, endDate) => {
    const pool = await getConnection();

    let query = `
        SELECT 
            h.bill_no as Bill_Id, 
            t.tran_desc as Item_Name, 
            t.tran_qty as Qty, 
            t.unit_price as UnitPrice, 
            t.tran_amt as LineTotal, 
            h.bill_date as TransDate
        FROM bill_header h
        INNER JOIN bill_tran t ON h.bill_no = t.bill_no
        WHERE h.bill_valid != 'X' AND t.tran_type = 'S'
    `;

    const request = pool.request();

    if (startDate && endDate) {
        query += ` AND CAST(h.bill_date AS DATE) BETWEEN @startDate AND @endDate`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    } else if (startDate) {
        query += ` AND CAST(h.bill_date AS DATE) >= @startDate`;
        request.input('startDate', sql.Date, startDate);
    } else if (endDate) {
        query += ` AND CAST(h.bill_date AS DATE) <= @endDate`;
        request.input('endDate', sql.Date, endDate);
    }

    query += ` ORDER BY h.bill_date DESC`;

    const result = await request.query(query);
    return result.recordset;
};

export const getHistoryStats = async (startDate, endDate) => {
    const pool = await getConnection();
    const request = pool.request();

    let query = `
        SELECT 
            ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN bill_amt ELSE 0 END), 0) as total_revenue,
            ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN Service_charge_Amt ELSE 0 END), 0) as total_service_charge,
            COUNT(DISTINCT CASE WHEN bill_valid != 'X' THEN bill_no END) as bill_count,
            COUNT(DISTINCT CASE WHEN bill_valid = 'X' THEN bill_no END) as cancelled_count,
            ISNULL(SUM(CASE WHEN Ord_Type = 'TO' AND bill_valid != 'X' THEN No_Of_Pax ELSE 0 END), 0) as guest_count
        FROM bill_header
        WHERE 1=1
    `;

    if (startDate && endDate) {
        query += ` AND CAST(bill_date AS DATE) BETWEEN @startDate AND @endDate`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    } else if (startDate) {
        query += ` AND CAST(bill_date AS DATE) >= @startDate`;
        request.input('startDate', sql.Date, startDate);
    } else if (endDate) {
        query += ` AND CAST(bill_date AS DATE) <= @endDate`;
        request.input('endDate', sql.Date, endDate);
    }

    const result = await request.query(query);
    return result.recordset[0];
};

export const getHistorySalesTrend = async (startDate, endDate) => {
    const pool = await getConnection();
    const request = pool.request();

    let query = `
        SELECT 
            FORMAT(bill_date, 'MM/dd') as date,
            SUM(bill_amt) as revenue
        FROM bill_header
        WHERE bill_valid != 'X'
    `;

    if (startDate && endDate) {
        query += ` AND CAST(bill_date AS DATE) BETWEEN @startDate AND @endDate`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    }

    query += ` GROUP BY FORMAT(bill_date, 'MM/dd'), CAST(bill_date AS DATE) ORDER BY CAST(bill_date AS DATE)`;

    const result = await request.query(query);
    return result.recordset;
};

export const getHistoryTopItems = async (startDate, endDate) => {
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

    if (startDate && endDate) {
        query += ` AND CAST(h.bill_date AS DATE) BETWEEN @startDate AND @endDate`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    }

    query += ` GROUP BY t.tran_desc ORDER BY quantity DESC`;

    const result = await request.query(query);
    return result.recordset;
};

export const getHistoryOrderTypes = async (startDate, endDate) => {
    const pool = await getConnection();
    const request = pool.request();

    let query = `
        SELECT 
            CASE 
                WHEN Ord_Type = 'TO' THEN 'Table Order'
                WHEN Ord_Type = 'TA' THEN 'Take Away'
                WHEN Ord_Type = 'DE' THEN 'Delivery'
                WHEN Ord_Type = 'QS' THEN 'Quick Service'
                WHEN Ord_Type = 'CO' THEN 'Complimentary'
                ELSE Ord_Type 
            END as type,
            COUNT(DISTINCT bill_no) as count
        FROM bill_header
        WHERE bill_valid != 'X'
    `;

    if (startDate && endDate) {
        query += ` AND CAST(bill_date AS DATE) BETWEEN @startDate AND @endDate`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    }

    query += ` GROUP BY Ord_Type`;

    const result = await request.query(query);
    return result.recordset;
};

export const getHistoryPaymentMethods = async (startDate, endDate) => {
    const pool = await getConnection();
    const request = pool.request();

    let query = `
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
          AND t.type_code IN ('MM', 'CC', 'CS', 'CO', 'ST')
    `;

    if (startDate && endDate) {
        query += ` AND CAST(h.bill_date AS DATE) BETWEEN @startDate AND @endDate`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    }

    query += ` GROUP BY type_code`;

    const result = await request.query(query);
    return result.recordset;
};

export default {
    getHistory,
    getHistoryStats,
    getHistorySalesTrend,
    getHistoryTopItems,
    getHistoryOrderTypes,
    getHistoryPaymentMethods
};
