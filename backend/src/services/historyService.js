import { getConnection } from '../config/db.js';
import sql from 'mssql';

export const getHistory = async (startDate, endDate) => {
    const pool = await getConnection();

    let query = `
        SELECT 
            bill_no as Bill_Id, 
            tran_desc as Item_Name, 
            tran_qty as Qty, 
            unit_price as UnitPrice, 
            tran_amt as LineTotal, 
            bill_date as TransDate
        FROM History_tran
    `;

    const request = pool.request();

    if (startDate && endDate) {
        query += ` WHERE bill_date BETWEEN @startDate AND @endDate`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    } else if (startDate) {
        query += ` WHERE bill_date >= @startDate`;
        request.input('startDate', sql.Date, startDate);
    } else if (endDate) {
        query += ` WHERE bill_date <= @endDate`;
        request.input('endDate', sql.Date, endDate);
    }

    query += ` ORDER BY bill_date DESC`;

    const result = await request.query(query);
    return result.recordset;
};

export const getHistoryStats = async (startDate, endDate) => {
    const pool = await getConnection();
    const request = pool.request();

    let query = `
        SELECT 
            ISNULL(SUM(tran_amt2), 0) as total_revenue,
            COUNT(DISTINCT bill_no) as bill_count,
            COUNT(DISTINCT CASE WHEN tran_valid = 'V' THEN bill_no END) as cancelled_count
        FROM History_tran
    `;

    if (startDate && endDate) {
        query += ` WHERE bill_date BETWEEN @startDate AND @endDate`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    } else if (startDate) {
        query += ` WHERE bill_date >= @startDate`;
        request.input('startDate', sql.Date, startDate);
    } else if (endDate) {
        query += ` WHERE bill_date <= @endDate`;
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
            SUM(tran_amt2) as revenue
        FROM History_tran
    `;

    if (startDate && endDate) {
        query += ` WHERE bill_date BETWEEN @startDate AND @endDate`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    }

    query += ` GROUP BY FORMAT(bill_date, 'MM/dd'), bill_date ORDER BY bill_date`;

    const result = await request.query(query);
    return result.recordset;
};

export const getHistoryTopItems = async (startDate, endDate) => {
    const pool = await getConnection();
    const request = pool.request();

    let query = `
        SELECT TOP 3
            tran_desc as name,
            SUM(tran_qty) as quantity
        FROM History_tran
    `;

    if (startDate && endDate) {
        query += ` WHERE bill_date BETWEEN @startDate AND @endDate`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    }

    query += ` GROUP BY tran_desc ORDER BY quantity DESC`;

    const result = await request.query(query);
    return result.recordset;
};

export const getHistoryOrderTypes = async (startDate, endDate) => {
    const pool = await getConnection();
    const request = pool.request();

    let query = `
        SELECT 
            Order_type as type,
            COUNT(DISTINCT bill_no) as count
        FROM History_tran
    `;

    if (startDate && endDate) {
        query += ` WHERE bill_date BETWEEN @startDate AND @endDate`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    }

    query += ` GROUP BY Order_type`;

    const result = await request.query(query);
    return result.recordset;
};

export default {
    getHistory,
    getHistoryStats,
    getHistorySalesTrend,
    getHistoryTopItems,
    getHistoryOrderTypes
};
