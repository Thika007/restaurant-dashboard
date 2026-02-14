import { getConnection } from '../config/db.js';
import sql from 'mssql';

export const getHistory = async (startDate, endDate, locationId) => {
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

    if (locationId && String(locationId).trim() !== '000') {
        const trimmedLocId = String(locationId).trim();
        query += ` AND LTRIM(RTRIM(h.loc_id)) = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

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

export const getHistoryStats = async (startDate, endDate, locationId) => {
    const pool = await getConnection();
    const request = pool.request();

    let locFilter = "";
    if (locationId && String(locationId).trim() !== '000') {
        const trimmedLocId = String(locationId).trim();
        locFilter = ` AND LTRIM(RTRIM(loc_id)) = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

    let dateFilter = "";
    if (startDate && endDate) {
        dateFilter = ` AND CAST(bill_date AS DATE) BETWEEN @startDate AND @endDate`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    } else if (startDate) {
        dateFilter = ` AND CAST(bill_date AS DATE) >= @startDate`;
        request.input('startDate', sql.Date, startDate);
    } else if (endDate) {
        dateFilter = ` AND CAST(bill_date AS DATE) <= @endDate`;
        request.input('endDate', sql.Date, endDate);
    }

    let query = `
        SELECT 
            (SELECT ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN bill_amt ELSE 0 END), 0) FROM bill_header WHERE 1=1 ${locFilter} ${dateFilter}) as total_revenue,
            (SELECT ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN bill_amt - tax - Service_charge_Amt ELSE 0 END), 0) FROM bill_header WHERE 1=1 ${locFilter} ${dateFilter}) as net_revenue,
            (SELECT ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN Service_charge_Amt ELSE 0 END), 0) FROM bill_header WHERE 1=1 ${locFilter} ${dateFilter}) as total_service_charge,
            (SELECT COUNT(DISTINCT CASE WHEN bill_valid != 'X' AND Service_charge_Amt > 0 THEN bill_no END) FROM bill_header WHERE 1=1 ${locFilter} ${dateFilter}) as service_charge_count,
            (SELECT ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN ABS(Discount_Amt) ELSE 0 END), 0) FROM bill_header WHERE 1=1 ${locFilter} ${dateFilter}) as total_discount,
            (SELECT COUNT(DISTINCT CASE WHEN bill_valid != 'X' AND ABS(Discount_Amt) > 0 THEN bill_no END) FROM bill_header WHERE 1=1 ${locFilter} ${dateFilter}) as discount_count,
            (SELECT COUNT(DISTINCT CASE WHEN bill_valid != 'X' THEN bill_no END) FROM bill_header WHERE 1=1 ${locFilter} ${dateFilter}) as bill_count,
            (SELECT ISNULL(SUM(CASE WHEN bill_valid = 'X' THEN bill_amt ELSE 0 END), 0) FROM bill_header WHERE 1=1 ${locFilter} ${dateFilter}) as cancelled_amount,
            (SELECT COUNT(DISTINCT CASE WHEN bill_valid = 'X' THEN bill_no END) FROM bill_header WHERE 1=1 ${locFilter} ${dateFilter}) as cancelled_count,
            (SELECT ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN No_Of_Pax ELSE 0 END), 0) FROM bill_header WHERE 1=1 ${locFilter} ${dateFilter}) as guest_count,

            (SELECT ISNULL(SUM(ABS(t.tran_amt2)), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE h.bill_valid != 'X' AND t.type_code IN ('R', 'RR') ${locFilter.replace('loc_id', 'h.loc_id')} ${dateFilter.replace(/bill_date/g, 'h.bill_date')}) as refund_amount,
            (SELECT ISNULL(SUM(ABS(t.tran_qty)), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE h.bill_valid != 'X' AND t.type_code IN ('R', 'RR') ${locFilter.replace('loc_id', 'h.loc_id')} ${dateFilter.replace(/bill_date/g, 'h.bill_date')}) as refund_items_count,
            (SELECT COUNT(DISTINCT t.bill_no) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE h.bill_valid != 'X' AND t.type_code IN ('R', 'RR') ${locFilter.replace('loc_id', 'h.loc_id')} ${dateFilter.replace(/bill_date/g, 'h.bill_date')}) as refund_count,
            
            (SELECT ISNULL(SUM(ABS(t.tran_amt2)), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE h.bill_valid != 'X' AND t.type_code = 'VV' ${locFilter.replace('loc_id', 'h.loc_id')} ${dateFilter.replace(/bill_date/g, 'h.bill_date')}) as void_amount,
            (SELECT ISNULL(SUM(CASE WHEN t.unit_price > 0 THEN ABS(t.tran_amt2) / t.unit_price ELSE 0 END), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE h.bill_valid != 'X' AND t.type_code = 'VV' ${locFilter.replace('loc_id', 'h.loc_id')} ${dateFilter.replace(/bill_date/g, 'h.bill_date')}) as void_items_count,
            (SELECT COUNT(DISTINCT t.bill_no) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE h.bill_valid != 'X' AND t.type_code = 'VV' ${locFilter.replace('loc_id', 'h.loc_id')} ${dateFilter.replace(/bill_date/g, 'h.bill_date')}) as void_count,
            
            (SELECT ISNULL(SUM(ABS(t.tran_amt2)), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE h.bill_valid != 'X' AND t.type_code = 'CO' ${locFilter.replace('loc_id', 'h.loc_id')} ${dateFilter.replace(/bill_date/g, 'h.bill_date')}) as complimentary_amount,
            (SELECT COUNT(DISTINCT t.bill_no) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE h.bill_valid != 'X' AND t.type_code = 'CO' ${locFilter.replace('loc_id', 'h.loc_id')} ${dateFilter.replace(/bill_date/g, 'h.bill_date')}) as complimentary_count,
            
            (SELECT ISNULL(SUM(ABS(t.tran_amt2)), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE h.bill_valid != 'X' AND t.type_code = 'ST' ${locFilter.replace('loc_id', 'h.loc_id')} ${dateFilter.replace(/bill_date/g, 'h.bill_date')}) as staff_amount,
            (SELECT COUNT(DISTINCT t.bill_no) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE h.bill_valid != 'X' AND t.type_code = 'ST' ${locFilter.replace('loc_id', 'h.loc_id')} ${dateFilter.replace(/bill_date/g, 'h.bill_date')}) as staff_count,
            
            (SELECT ISNULL(SUM(ABS(t.tran_amt2)), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE h.bill_valid != 'X' AND t.type_code = 'WA' ${locFilter.replace('loc_id', 'h.loc_id')} ${dateFilter.replace(/bill_date/g, 'h.bill_date')}) as waste_amount,
            (SELECT ISNULL(SUM(ABS(t.tran_qty)), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE h.bill_valid != 'X' AND (t.type_code = 'RS' OR t.tran_type = 'S') AND EXISTS (SELECT 1 FROM bill_tran t2 WHERE t2.bill_no = h.bill_no AND t2.type_code = 'WA') ${locFilter.replace('loc_id', 'h.loc_id')} ${dateFilter.replace(/bill_date/g, 'h.bill_date')}) as waste_items_count,
            (SELECT COUNT(DISTINCT t.bill_no) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE h.bill_valid != 'X' AND t.type_code = 'WA' ${locFilter.replace('loc_id', 'h.loc_id')} ${dateFilter.replace(/bill_date/g, 'h.bill_date')}) as waste_count,
            
            (SELECT ISNULL(SUM(ABS(t.tran_amt2)), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE h.bill_valid != 'X' AND t.type_code = 'CS' ${locFilter.replace('loc_id', 'h.loc_id')} ${dateFilter.replace(/bill_date/g, 'h.bill_date')}) as credit_amount,
            (SELECT COUNT(DISTINCT t.bill_no) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE h.bill_valid != 'X' AND t.type_code = 'CS' ${locFilter.replace('loc_id', 'h.loc_id')} ${dateFilter.replace(/bill_date/g, 'h.bill_date')}) as credit_count,
            
            (SELECT ISNULL(SUM(ABS(t.tran_amt2)), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE h.bill_valid != 'X' AND t.type_code = 'CP' ${locFilter.replace('loc_id', 'h.loc_id')} ${dateFilter.replace(/bill_date/g, 'h.bill_date')}) as credit_pay_amount,
            (SELECT COUNT(DISTINCT t.bill_no) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE h.bill_valid != 'X' AND t.type_code = 'CP' ${locFilter.replace('loc_id', 'h.loc_id')} ${dateFilter.replace(/bill_date/g, 'h.bill_date')}) as credit_pay_count,

            -- Order Type Metrics
            (SELECT ISNULL(SUM(h.bill_amt - h.tax - h.Service_charge_Amt), 0) FROM bill_header h WHERE 1=1 AND h.bill_valid != 'X' AND h.Ord_Type = 'TO' ${locFilter} ${dateFilter}) as table_order_amount,
            (SELECT COUNT(h.bill_no) FROM bill_header h WHERE 1=1 AND h.bill_valid != 'X' AND h.Ord_Type = 'TO' ${locFilter} ${dateFilter}) as table_order_count,
            (SELECT ISNULL(SUM(h.No_Of_Pax), 0) FROM bill_header h WHERE 1=1 AND h.bill_valid != 'X' AND h.Ord_Type = 'TO' ${locFilter} ${dateFilter}) as table_order_guests,

            (SELECT ISNULL(SUM(h.bill_amt - h.tax - h.Service_charge_Amt), 0) FROM bill_header h WHERE 1=1 AND h.bill_valid != 'X' AND h.Ord_Type = 'TA' ${locFilter} ${dateFilter}) as takeaway_order_amount,
            (SELECT COUNT(h.bill_no) FROM bill_header h WHERE 1=1 AND h.bill_valid != 'X' AND h.Ord_Type = 'TA' ${locFilter} ${dateFilter}) as takeaway_order_count,
            (SELECT ISNULL(SUM(h.No_Of_Pax), 0) FROM bill_header h WHERE 1=1 AND h.bill_valid != 'X' AND h.Ord_Type = 'TA' ${locFilter} ${dateFilter}) as takeaway_order_guests,

            (SELECT ISNULL(SUM(h.bill_amt - h.tax - h.Service_charge_Amt), 0) FROM bill_header h WHERE 1=1 AND h.bill_valid != 'X' AND h.Ord_Type = 'DE' ${locFilter} ${dateFilter}) as delivery_order_amount,
            (SELECT COUNT(h.bill_no) FROM bill_header h WHERE 1=1 AND h.bill_valid != 'X' AND h.Ord_Type = 'DE' ${locFilter} ${dateFilter}) as delivery_order_count,
            (SELECT ISNULL(SUM(h.No_Of_Pax), 0) FROM bill_header h WHERE 1=1 AND h.bill_valid != 'X' AND h.Ord_Type = 'DE' ${locFilter} ${dateFilter}) as delivery_order_guests,

            (SELECT ISNULL(SUM(h.bill_amt - h.tax - h.Service_charge_Amt), 0) FROM bill_header h WHERE 1=1 AND h.bill_valid != 'X' AND h.Ord_Type = 'QS' ${locFilter} ${dateFilter}) as quick_service_order_amount,
            (SELECT COUNT(h.bill_no) FROM bill_header h WHERE 1=1 AND h.bill_valid != 'X' AND h.Ord_Type = 'QS' ${locFilter} ${dateFilter}) as quick_service_order_count,
            (SELECT ISNULL(SUM(h.No_Of_Pax), 0) FROM bill_header h WHERE 1=1 AND h.bill_valid != 'X' AND h.Ord_Type = 'QS' ${locFilter} ${dateFilter}) as quick_service_order_guests,
            
            (SELECT ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN tax ELSE 0 END), 0) FROM bill_header WHERE 1=1 ${locFilter} ${dateFilter}) as total_tax,
            (SELECT COUNT(DISTINCT CASE WHEN bill_valid != 'X' AND tax > 0 THEN bill_no END) FROM bill_header WHERE 1=1 ${locFilter} ${dateFilter}) as tax_count
    `;

    const result = await request.query(query);
    return result.recordset[0];
};

export const getHistorySalesTrend = async (startDate, endDate, locationId) => {
    const pool = await getConnection();
    const request = pool.request();

    let query = `
        SELECT 
            SUBSTRING(CONVERT(VARCHAR(10), bill_date, 101), 1, 5) as date,
            SUM(bill_amt) as revenue
        FROM bill_header
        WHERE bill_valid != 'X'
    `;

    if (locationId && String(locationId).trim() !== '000') {
        const trimmedLocId = String(locationId).trim();
        query += ` AND LTRIM(RTRIM(loc_id)) = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

    if (startDate && endDate) {
        query += ` AND CAST(bill_date AS DATE) BETWEEN @startDate AND @endDate`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    }

    query += ` GROUP BY SUBSTRING(CONVERT(VARCHAR(10), bill_date, 101), 1, 5), CAST(bill_date AS DATE) ORDER BY CAST(bill_date AS DATE)`;

    const result = await request.query(query);
    return result.recordset;
};

export const getHistoryTopItems = async (startDate, endDate, locationId) => {
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

    if (startDate && endDate) {
        query += ` AND CAST(h.bill_date AS DATE) BETWEEN @startDate AND @endDate`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    }

    query += ` GROUP BY t.tran_desc ORDER BY quantity DESC`;

    const result = await request.query(query);
    return result.recordset;
};

export const getHistoryOrderTypes = async (startDate, endDate, locationId) => {
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
            COUNT(DISTINCT bill_no) as count
        FROM bill_header
        WHERE bill_valid != 'X' AND Ord_Type IN ('DE', 'QS', 'TO', 'TA')
    `;

    if (locationId && String(locationId).trim() !== '000') {
        const trimmedLocId = String(locationId).trim();
        query += ` AND LTRIM(RTRIM(loc_id)) = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

    if (startDate && endDate) {
        query += ` AND CAST(bill_date AS DATE) BETWEEN @startDate AND @endDate`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    }

    query += ` GROUP BY Ord_Type`;

    const result = await request.query(query);
    return result.recordset;
};

export const getHistoryPaymentMethods = async (startDate, endDate, locationId) => {
    const pool = await getConnection();
    const request = pool.request();

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
          AND t.type_code IN ('MM', 'CC')
    `;

    if (locationId && String(locationId).trim() !== '000') {
        const trimmedLocId = String(locationId).trim();
        query += ` AND LTRIM(RTRIM(h.loc_id)) = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

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
