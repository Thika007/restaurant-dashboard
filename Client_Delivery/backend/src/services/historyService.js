import { getConnection } from '../config/db.js';
import sql from 'mssql';

export const getHistory = async (startDate, endDate, locationId, page = 1, pageSize = 50) => {
    const pool = await getConnection();
    const request = pool.request();

    let whereClause = ` WHERE h.bill_valid != 'X' AND t.tran_type = 'S'`;

    if (locationId && String(locationId).trim() !== '000') {
        const trimmedLocId = String(locationId).trim();
        whereClause += ` AND h.loc_id = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

    if (startDate && endDate) {
        whereClause += ` AND h.bill_date >= @startDate AND h.bill_date < DATEADD(day, 1, @endDate)`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    } else if (startDate) {
        whereClause += ` AND h.bill_date >= @startDate`;
        request.input('startDate', sql.Date, startDate);
    } else if (endDate) {
        whereClause += ` AND h.bill_date < DATEADD(day, 1, @endDate)`;
        request.input('endDate', sql.Date, endDate);
    }

    // Get total count
    const countQuery = `
        SELECT COUNT(*) as total
        FROM History_header h WITH (NOLOCK)
        INNER JOIN History_tran t WITH (NOLOCK) ON h.bill_no = t.bill_no AND h.loc_id = t.Loc_id AND h.mech_no = t.mech_no AND h.bill_date = t.bill_date
        ${whereClause}
    `;
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0]?.total || 0;

    // Get paginated data
    const offset = (page - 1) * pageSize;
    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, pageSize);

    const dataQuery = `
        SELECT 
            h.bill_no as Bill_Id, 
            t.tran_desc as Item_Name, 
            t.tran_qty as Qty, 
            t.unit_price as UnitPrice, 
            t.tran_amt as LineTotal, 
            h.bill_date as TransDate
        FROM History_header h WITH (NOLOCK)
        INNER JOIN History_tran t WITH (NOLOCK) ON h.bill_no = t.bill_no AND h.loc_id = t.Loc_id AND h.mech_no = t.mech_no AND h.bill_date = t.bill_date
        ${whereClause}
        ORDER BY h.bill_date DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
    `;

    const result = await request.query(dataQuery);
    return { data: result.recordset, total };
};

export const getHistoryStats = async (startDate, endDate, locationId) => {
    const pool = await getConnection();

    // Build filter strings for both header-only and joined queries
    const trimmedLocId = (locationId && String(locationId).trim() !== '000') ? String(locationId).trim() : null;

    const headerLocFilter = trimmedLocId ? ` AND loc_id = @locationId` : '';
    const joinedLocFilter = trimmedLocId ? ` AND h.loc_id = @locationId` : '';

    let headerDateFilter = '';
    let joinedDateFilter = '';
    if (startDate && endDate) {
        headerDateFilter = ` AND bill_date >= @startDate AND bill_date < DATEADD(day, 1, @endDate)`;
        joinedDateFilter = ` AND h.bill_date >= @startDate AND h.bill_date < DATEADD(day, 1, @endDate)`;
    } else if (startDate) {
        headerDateFilter = ` AND bill_date >= @startDate`;
        joinedDateFilter = ` AND h.bill_date >= @startDate`;
    } else if (endDate) {
        headerDateFilter = ` AND bill_date < DATEADD(day, 1, @endDate)`;
        joinedDateFilter = ` AND h.bill_date < DATEADD(day, 1, @endDate)`;
    }

    // Helper to bind common parameters to a fresh request
    const bindParams = (request) => {
        if (trimmedLocId) request.input('locationId', sql.VarChar, trimmedLocId);
        if (startDate) request.input('startDate', sql.Date, startDate);
        if (endDate) request.input('endDate', sql.Date, endDate);
        return request;
    };

    // Query 1: Header-level stats in a single pass
    const headerQuery = `
        SELECT 
            ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN bill_amt ELSE 0 END), 0) as total_revenue,
            ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN bill_amt - tax - Service_charge_Amt ELSE 0 END), 0) as net_revenue,
            ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN Service_charge_Amt ELSE 0 END), 0) as total_service_charge,
            SUM(CASE WHEN bill_valid != 'X' AND Service_charge_Amt > 0 THEN 1 ELSE 0 END) as service_charge_count,
            ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN ABS(Discount_Amt) ELSE 0 END), 0) as total_discount,
            SUM(CASE WHEN bill_valid != 'X' AND ABS(Discount_Amt) > 0 THEN 1 ELSE 0 END) as discount_count,
            SUM(CASE WHEN bill_valid != 'X' THEN 1 ELSE 0 END) as bill_count,
            ISNULL(SUM(CASE WHEN bill_valid = 'X' THEN bill_amt ELSE 0 END), 0) as cancelled_amount,
            SUM(CASE WHEN bill_valid = 'X' THEN 1 ELSE 0 END) as cancelled_count,
            ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN No_Of_Pax ELSE 0 END), 0) as guest_count,

            -- Order Type Metrics
            ISNULL(SUM(CASE WHEN bill_valid != 'X' AND Ord_Type = 'TO' THEN bill_amt - tax - Service_charge_Amt ELSE 0 END), 0) as table_order_amount,
            SUM(CASE WHEN bill_valid != 'X' AND Ord_Type = 'TO' THEN 1 ELSE 0 END) as table_order_count,
            ISNULL(SUM(CASE WHEN bill_valid != 'X' AND Ord_Type = 'TO' THEN No_Of_Pax ELSE 0 END), 0) as table_order_guests,

            ISNULL(SUM(CASE WHEN bill_valid != 'X' AND Ord_Type = 'TA' THEN bill_amt - tax - Service_charge_Amt ELSE 0 END), 0) as takeaway_order_amount,
            SUM(CASE WHEN bill_valid != 'X' AND Ord_Type = 'TA' THEN 1 ELSE 0 END) as takeaway_order_count,
            ISNULL(SUM(CASE WHEN bill_valid != 'X' AND Ord_Type = 'TA' THEN No_Of_Pax ELSE 0 END), 0) as takeaway_order_guests,

            ISNULL(SUM(CASE WHEN bill_valid != 'X' AND Ord_Type = 'DE' THEN bill_amt - tax - Service_charge_Amt ELSE 0 END), 0) as delivery_order_amount,
            SUM(CASE WHEN bill_valid != 'X' AND Ord_Type = 'DE' THEN 1 ELSE 0 END) as delivery_order_count,
            ISNULL(SUM(CASE WHEN bill_valid != 'X' AND Ord_Type = 'DE' THEN No_Of_Pax ELSE 0 END), 0) as delivery_order_guests,

            ISNULL(SUM(CASE WHEN bill_valid != 'X' AND Ord_Type = 'QS' THEN bill_amt - tax - Service_charge_Amt ELSE 0 END), 0) as quick_service_order_amount,
            SUM(CASE WHEN bill_valid != 'X' AND Ord_Type = 'QS' THEN 1 ELSE 0 END) as quick_service_order_count,
            ISNULL(SUM(CASE WHEN bill_valid != 'X' AND Ord_Type = 'QS' THEN No_Of_Pax ELSE 0 END), 0) as quick_service_order_guests,
            
            ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN tax ELSE 0 END), 0) as total_tax,
            SUM(CASE WHEN bill_valid != 'X' AND tax > 0 THEN 1 ELSE 0 END) as tax_count
        FROM History_header WITH (NOLOCK)
        WHERE 1=1 ${headerLocFilter} ${headerDateFilter}
    `;

    // Query 2: Transaction-level stats grouped by type_code — includes waste items count
    const tranQuery = `
        SELECT 
            t.type_code,
            SUM(ABS(t.tran_amt2)) as total_amt2,
            SUM(ABS(t.tran_qty)) as total_qty,
            COUNT(DISTINCT t.bill_no) as bill_count,
            SUM(CASE WHEN t.unit_price > 0 THEN ABS(t.tran_amt2) / t.unit_price ELSE 0 END) as void_qty_calculated
        FROM History_tran t WITH (NOLOCK)
        INNER JOIN History_header h WITH (NOLOCK) ON t.bill_no = h.bill_no AND t.Loc_id = h.loc_id AND t.mech_no = h.mech_no AND t.bill_date = h.bill_date
        WHERE h.bill_valid != 'X' ${joinedLocFilter} ${joinedDateFilter}
        GROUP BY t.type_code
    `;

    // Query 3: Waste items count — use JOIN instead of correlated EXISTS for better performance
    const wasteItemsQuery = `
        SELECT ISNULL(SUM(ABS(t.tran_qty)), 0) as waste_items_count
        FROM History_tran t WITH (NOLOCK)
        INNER JOIN History_header h WITH (NOLOCK) ON t.bill_no = h.bill_no AND t.Loc_id = h.loc_id AND t.mech_no = h.mech_no AND t.bill_date = h.bill_date
        INNER JOIN (
            SELECT DISTINCT bill_no, Loc_id, mech_no, bill_date 
            FROM History_tran WITH (NOLOCK) 
            WHERE type_code = 'WA'
        ) w ON w.bill_no = t.bill_no AND w.Loc_id = t.Loc_id AND w.mech_no = t.mech_no AND w.bill_date = t.bill_date
        WHERE h.bill_valid != 'X' 
          AND (t.type_code = 'RS' OR t.tran_type = 'S')
          ${joinedLocFilter} 
          ${joinedDateFilter}
    `;

    // Run all 3 queries IN PARALLEL using separate request objects
    const [headerResult, tranResult, wasteItemsResult] = await Promise.all([
        bindParams(pool.request()).query(headerQuery),
        bindParams(pool.request()).query(tranQuery),
        bindParams(pool.request()).query(wasteItemsQuery)
    ]);

    const headerStats = headerResult.recordset[0] || {};
    const tranRows = tranResult.recordset || [];
    const wasteItemsCount = wasteItemsResult.recordset[0]?.waste_items_count || 0;

    // Helper to extract aggregates
    const getTranStatsForTypes = (types) => {
        const matching = tranRows.filter(r => types.includes(r.type_code));
        return {
            amount: matching.reduce((sum, r) => sum + (r.total_amt2 || 0), 0),
            qty: matching.reduce((sum, r) => sum + (r.total_qty || 0), 0),
            count: matching.reduce((sum, r) => sum + (r.bill_count || 0), 0),
            voidQty: matching.reduce((sum, r) => sum + (r.void_qty_calculated || 0), 0)
        };
    };

    const refund = getTranStatsForTypes(['R', 'RR']);
    const voidStats = getTranStatsForTypes(['VV']);
    const complimentary = getTranStatsForTypes(['CO']);
    const staff = getTranStatsForTypes(['ST']);
    const waste = getTranStatsForTypes(['WA']);
    const credit = getTranStatsForTypes(['CS']);
    const creditPay = getTranStatsForTypes(['CP']);

    return {
        ...headerStats,
        
        refund_amount: refund.amount,
        refund_items_count: refund.qty,
        refund_count: refund.count,

        void_amount: voidStats.amount,
        void_items_count: voidStats.voidQty,
        void_count: voidStats.count,

        complimentary_amount: complimentary.amount,
        complimentary_count: complimentary.count,

        staff_amount: staff.amount,
        staff_count: staff.count,

        waste_amount: waste.amount,
        waste_items_count: wasteItemsCount,
        waste_count: waste.count,

        credit_amount: credit.amount,
        credit_count: credit.count,

        credit_pay_amount: creditPay.amount,
        credit_pay_count: creditPay.count
    };
};


export const getHistorySalesTrend = async (startDate, endDate, locationId) => {
    const pool = await getConnection();
    const request = pool.request();

    let query = `
        SELECT 
            SUBSTRING(CONVERT(VARCHAR(10), bill_date, 101), 1, 5) as date,
            SUM(bill_amt) as revenue
        FROM History_header WITH (NOLOCK)
        WHERE bill_valid != 'X'
    `;

    if (locationId && String(locationId).trim() !== '000') {
        const trimmedLocId = String(locationId).trim();
        query += ` AND loc_id = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

    if (startDate && endDate) {
        query += ` AND bill_date >= @startDate AND bill_date < DATEADD(day, 1, @endDate)`;
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
        FROM History_tran t WITH (NOLOCK)
        INNER JOIN History_header h WITH (NOLOCK) ON t.bill_no = h.bill_no AND t.Loc_id = h.loc_id AND t.mech_no = h.mech_no AND t.bill_date = h.bill_date
        WHERE h.bill_valid != 'X' AND t.tran_type = 'S'
    `;

    if (locationId && String(locationId).trim() !== '000') {
        const trimmedLocId = String(locationId).trim();
        query += ` AND h.loc_id = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

    if (startDate && endDate) {
        query += ` AND h.bill_date >= @startDate AND h.bill_date < DATEADD(day, 1, @endDate)`;
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
            COUNT(*) as count
        FROM History_header WITH (NOLOCK)
        WHERE bill_valid != 'X' AND Ord_Type IN ('DE', 'QS', 'TO', 'TA')
    `;

    if (locationId && String(locationId).trim() !== '000') {
        const trimmedLocId = String(locationId).trim();
        query += ` AND loc_id = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

    if (startDate && endDate) {
        query += ` AND bill_date >= @startDate AND bill_date < DATEADD(day, 1, @endDate)`;
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
        FROM History_tran t WITH (NOLOCK)
        INNER JOIN History_header h WITH (NOLOCK) ON t.bill_no = h.bill_no AND t.Loc_id = h.loc_id AND t.mech_no = h.mech_no AND t.bill_date = h.bill_date
        WHERE h.bill_valid != 'X'
          AND t.type_code IN ('MM', 'CC')
    `;

    if (locationId && String(locationId).trim() !== '000') {
        const trimmedLocId = String(locationId).trim();
        query += ` AND h.loc_id = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

    if (startDate && endDate) {
        query += ` AND h.bill_date >= @startDate AND h.bill_date < DATEADD(day, 1, @endDate)`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    }

    query += ` GROUP BY type_code`;

    const result = await request.query(query);
    return result.recordset;
};

export const getHistoryCollections = async (startDate, endDate, locationId) => {
    const pool = await getConnection();
    const request = pool.request();

    let locFilter = "";
    if (locationId && String(locationId).trim() !== '000') {
        const trimmedLocId = String(locationId).trim();
        locFilter = ` AND h.loc_id = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

    let dateFilter = "";
    if (startDate && endDate) {
        dateFilter = ` AND h.bill_date >= @startDate AND h.bill_date < DATEADD(day, 1, @endDate)`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    } else if (startDate) {
        dateFilter = ` AND h.bill_date >= @startDate`;
        request.input('startDate', sql.Date, startDate);
    } else if (endDate) {
        dateFilter = ` AND h.bill_date < DATEADD(day, 1, @endDate)`;
        request.input('endDate', sql.Date, endDate);
    }

    const query = `
        SELECT 
            t.type_code,
            t.key_code,
            cc.cc_name,
            SUM(ABS(t.tran_amt2)) as total_amount,
            SUM(ABS(t.tran_qty)) as total_qty,
            COUNT(DISTINCT t.bill_no) as bill_count
        FROM History_tran t WITH (NOLOCK)
        INNER JOIN History_header h WITH (NOLOCK) ON t.bill_no = h.bill_no AND t.Loc_id = h.loc_id AND t.mech_no = h.mech_no AND t.bill_date = h.bill_date
        LEFT JOIN cc_mast cc WITH (NOLOCK) ON LTRIM(RTRIM(t.key_code)) = LTRIM(RTRIM(cc.cc_no)) AND t.type_code = 'CC'
        WHERE h.bill_valid != 'X' 
          AND t.type_code IN ('MM', 'CC', 'CS', 'CP', 'CO', 'ST', 'WA', 'R', 'RR', 'VV')
          ${locFilter}
          ${dateFilter}
        GROUP BY t.type_code, t.key_code, cc.cc_name
    `;

    const result = await request.query(query);
    const rows = result.recordset || [];

    // Format and group them nicely
    const collections = rows.map(row => {
        let name = 'Other';
        if (row.type_code === 'MM') name = 'Cash';
        else if (row.type_code === 'CC') name = row.cc_name || 'Card Pay';
        else if (row.type_code === 'CS') name = 'Credit';
        else if (row.type_code === 'CP') name = 'Credit paid';
        else if (row.type_code === 'CO') name = 'Complementary';
        else if (row.type_code === 'ST') name = 'Staff';
        else if (row.type_code === 'WA') name = 'Wastage';
        else if (row.type_code === 'VV') name = 'Void';
        else if (row.type_code === 'R' || row.type_code === 'RR') name = 'Refund';

        return {
            typeCode: row.type_code,
            keyCode: row.key_code || '',
            name,
            amount: row.total_amount || 0,
            qty: row.total_qty || 0,
            billCount: row.bill_count || 0
        };
    });

    return collections;
};

export default {
    getHistory,
    getHistoryStats,
    getHistorySalesTrend,
    getHistoryTopItems,
    getHistoryOrderTypes,
    getHistoryPaymentMethods,
    getHistoryCollections
};

