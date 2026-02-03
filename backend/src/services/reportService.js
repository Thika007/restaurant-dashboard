import { getConnection } from '../config/db.js';
import sql from 'mssql';

export const getBillReport = async (startDate, endDate, filters = {}) => {
    const pool = await getConnection();
    const request = pool.request();

    let query = `
        SELECT 
            h.bill_no as Bill_Id,
            ISNULL((SELECT SUM(t.tran_amt) FROM bill_tran t WHERE t.bill_no = h.bill_no AND (t.tran_type = 'S' OR t.type_code = 'RS')), 0) as Amount,
            ISNULL(h.Discount_Amt, 0) as Discount_Amt,
            h.tax as TAX,
            h.Service_charge_Amt as Service_Charge,
            h.bill_amt as Total_Amount,
            CASE 
                WHEN h.bill_valid = 'X' THEN 'Cancel bill'
                WHEN EXISTS (SELECT 1 FROM bill_tran t2 WHERE t2.bill_no = h.bill_no AND t2.tran_valid = 'Y') THEN 'Incomplete Bill'
                ELSE (
                    SELECT TOP 1 
                        CASE 
                            WHEN t.type_code = 'CC' THEN ISNULL(cc.cc_name, 'Card Pay')
                            WHEN t.type_code = 'MM' THEN 'Cash'
                            WHEN t.type_code = 'CS' THEN 'Credit'
                            WHEN t.type_code = 'CP' THEN 'Credit paid'
                            WHEN t.type_code = 'R' THEN 'Refund'
                            WHEN t.type_code = 'CO' THEN 'Complementary bill'
                            WHEN t.type_code = 'VV' THEN 'Void bill'
                            WHEN t.type_code = 'XX' THEN 'Cancel bill'
                            WHEN t.type_code = 'ST' THEN 'Staff'
                            WHEN t.type_code = 'WA' THEN 'Wastage'
                            ELSE t.type_code 
                        END
                    FROM bill_tran t 
                    LEFT JOIN cc_mast cc ON LTRIM(RTRIM(t.key_code)) = LTRIM(RTRIM(cc.cc_no))
                    WHERE t.bill_no = h.bill_no 
                    AND t.type_code IN ('MM', 'CC', 'CS', 'CP', 'R', 'CO', 'VV', 'XX', 'ST', 'WA')
                )
            END as Transaction_Type,
            CASE 
                WHEN h.bill_valid = 'X' THEN 'X'
                WHEN EXISTS (SELECT 1 FROM bill_tran t2 WHERE t2.bill_no = h.bill_no AND t2.tran_valid = 'Y') THEN 'Y'
                ELSE (
                    SELECT TOP 1 
                        CASE 
                            WHEN t3.type_code = 'CC' THEN 'CC_' + LTRIM(RTRIM(t3.key_code))
                            ELSE t3.type_code 
                        END
                    FROM bill_tran t3 
                    WHERE t3.bill_no = h.bill_no AND t3.type_code IN ('MM', 'CC', 'CS', 'CP', 'R', 'CO', 'VV', 'XX', 'ST', 'WA')
                )
            END as Raw_Type,
            CASE 
                WHEN h.Ord_Type = 'TO' THEN 'Table Order'
                WHEN h.Ord_Type = 'TA' THEN 'Take Away'
                WHEN h.Ord_Type = 'DE' THEN 'Delivery'
                WHEN h.Ord_Type = 'QS' THEN 'Quick Service'
                ELSE h.Ord_Type
            END as Order_Type,
            h.remarks as Remark,
            h.bill_date
        FROM bill_header h
        WHERE 1=1
    `;

    if (startDate && endDate) {
        query += ` AND CAST(h.bill_date AS DATE) BETWEEN @startDate AND @endDate`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    }

    if (filters.locationId && String(filters.locationId).trim() !== '000') {
        const trimmedLocId = String(filters.locationId).trim();
        query += ` AND LTRIM(RTRIM(h.loc_id)) = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

    // Apply Order Type Filter
    if (filters.orderType && !filters.orderType.includes('all')) {
        const orderTypeMap = {
            table: 'TO',
            takeaway: 'TA',
            delivery: 'DE',
            quick: 'QS'
        };
        const dbOrderTypes = filters.orderType.map(t => orderTypeMap[t]).filter(t => t);
        if (dbOrderTypes.length > 0) {
            const params = [];
            dbOrderTypes.forEach((val, i) => {
                const paramName = `orderType${i}`;
                request.input(paramName, sql.VarChar, val);
                params.push(`@${paramName}`);
            });
            query += ` AND h.Ord_Type IN (${params.join(',')})`;
        }
    }

    let finalQuery = `
        WITH BillData AS (
            ${query}
        )
        SELECT * FROM BillData WHERE 1=1
    `;

    if (filters.txnType && !filters.txnType.includes('all')) {
        const txnMap = {
            cash: ['MM'],
            cardPay: ['CC'],
            credit: ['CS'],
            creditPaid: ['CP'],
            refund: ['R'],
            complimentary: ['CO'],
            void: ['VV'],
            staff: ['ST'],
            cancel: ['X', 'XX'],
            incomplete: ['Y'],
            wastage: ['WA']
        };

        const dbTxnTypes = [];
        const cardTypes = [];
        filters.txnType.forEach(t => {
            if (t.startsWith('CC_')) {
                cardTypes.push(t.substring(3));
            } else if (txnMap[t]) {
                dbTxnTypes.push(...txnMap[t]);
            }
        });

        if (dbTxnTypes.length > 0 || cardTypes.length > 0) {
            const params = [];
            dbTxnTypes.forEach((val, i) => {
                const paramName = `txnType${i}`;
                request.input(paramName, sql.VarChar, val);
                params.push(`@${paramName}`);
            });

            let txnClause = '';
            if (params.length > 0) {
                txnClause = `Raw_Type IN (${params.join(',')})`;
            }

            if (cardTypes.length > 0) {
                const cardParams = [];
                cardTypes.forEach((val, i) => {
                    const paramName = `cardType${i}`;
                    request.input(paramName, sql.VarChar, 'CC_' + val);
                    cardParams.push(`@${paramName}`);
                });
                const cardClause = `Raw_Type IN (${cardParams.join(',')})`;
                txnClause = txnClause ? `(${txnClause} OR ${cardClause})` : cardClause;
            }

            if (txnClause) {
                finalQuery += ` AND ${txnClause}`;
            }
        }
    }

    // Apply Sorting
    if (filters.sort) {
        if (filters.sort === 'minMax') {
            finalQuery += ` ORDER BY Total_Amount ASC`;
        } else if (filters.sort === 'maxMin') {
            finalQuery += ` ORDER BY Total_Amount DESC`;
        } else {
            finalQuery += ` ORDER BY Bill_Id ASC`;
        }
    } else {
        finalQuery += ` ORDER BY bill_date DESC`;
    }

    const result = await request.query(finalQuery);
    return result.recordset;
};

export const getItemReport = async (startDate, endDate, filters = {}) => {
    const pool = await getConnection();
    const request = pool.request();

    let query = `
        SELECT 
            t.bill_no as Bill_Id,
            t.KOTNo,
            t.tran_desc as Description,
            t.tran_qty as Qty,
            t.tran_amt as Amount,
            (SELECT TOP 1 t5.tran_ref FROM bill_tran t5 WHERE t5.bill_no = h.bill_no AND t5.tran_ref IS NOT NULL AND t5.tran_ref <> '') as Reason,
            h.bill_date,
            CASE 
                WHEN h.bill_valid = 'X' THEN 'X'
                WHEN EXISTS (SELECT 1 FROM bill_tran t2 WHERE t2.bill_no = h.bill_no AND t2.tran_valid = 'Y') THEN 'Y'
                ELSE (SELECT TOP 1 t3.type_code FROM bill_tran t3 WHERE t3.bill_no = h.bill_no AND t3.type_code IN ('MM', 'CC', 'CS', 'CP', 'R', 'CO', 'VV', 'XX', 'ST', 'WA'))
            END as Raw_Type,
            h.remarks as RemarkRow
        FROM bill_tran t
        INNER JOIN bill_header h ON t.bill_no = h.bill_no
        WHERE t.type_code = 'RS'
    `;

    if (startDate && endDate) {
        query += ` AND CAST(h.bill_date AS DATE) BETWEEN @startDate AND @endDate`;
        request.input('startDate', sql.Date, startDate);
        request.input('endDate', sql.Date, endDate);
    }

    if (filters.locationId && String(filters.locationId).trim() !== '000') {
        const trimmedLocId = String(filters.locationId).trim();
        query += ` AND LTRIM(RTRIM(h.loc_id)) = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

    // Apply Filters (Multi-select logic)
    if (filters.typeSelection && !filters.typeSelection.includes('all')) {
        const txnMap = {
            cash: ['MM'],
            card: ['CC'],
            complimentary: ['CO'],
            staff: ['ST'],
            credit: ['CS'],
            wastage: ['WA']
        };

        const ordTypeMap = {
            table: 'TO',
            takeaway: 'TA',
            delivery: 'DE',
            quick: 'QS'
        };

        const dbTxnTypes = [];
        const dbOrdTypes = [];
        const cardTypes = [];

        filters.typeSelection.forEach(t => {
            if (t.startsWith('CC_')) {
                cardTypes.push(t.substring(3));
            } else if (txnMap[t]) {
                dbTxnTypes.push(...txnMap[t]);
            }
            if (ordTypeMap[t]) dbOrdTypes.push(ordTypeMap[t]);
        });

        const filterClauses = [];
        if (dbTxnTypes.length > 0) {
            const params = [];
            dbTxnTypes.forEach((val, i) => {
                const paramName = `typeSel${i}`;
                request.input(paramName, sql.VarChar, val);
                params.push(`@${paramName}`);
            });
            filterClauses.push(`EXISTS (SELECT 1 FROM bill_tran t4 WHERE t4.bill_no = h.bill_no AND t4.type_code IN (${params.join(',')}))`);
        }

        if (cardTypes.length > 0) {
            const cardParams = [];
            cardTypes.forEach((val, i) => {
                const paramName = `cardTypeSel${i}`;
                request.input(paramName, sql.VarChar, val);
                cardParams.push(`@${paramName}`);
            });
            filterClauses.push(`EXISTS (SELECT 1 FROM bill_tran t4 WHERE t4.bill_no = h.bill_no AND t4.type_code = 'CC' AND LTRIM(RTRIM(t4.key_code)) IN (${cardParams.join(',')}))`);
        }

        if (dbOrdTypes.length > 0) {
            const params = [];
            dbOrdTypes.forEach((val, i) => {
                const paramName = `ordSel${i}`;
                request.input(paramName, sql.VarChar, val);
                params.push(`@${paramName}`);
            });
            filterClauses.push(`h.Ord_Type IN (${params.join(',')})`);
        }

        if (filterClauses.length > 0) {
            query += ` AND (${filterClauses.join(' OR ')})`;
        }
    }

    // Remark filter (Multi-select)
    if (filters.remark && !filters.remark.includes('all')) {
        const params = [];
        filters.remark.forEach((val, i) => {
            const paramName = `remark${i}`;
            request.input(paramName, sql.VarChar, `%${val}%`);
            params.push(`h.remarks LIKE @${paramName}`);
        });
        if (params.length > 0) {
            query += ` AND (${params.join(' OR ')})`;
        }
    }

    let finalQuery = `
        WITH ItemData AS (
            ${query}
        )
        SELECT * FROM ItemData WHERE 1=1
    `;

    // Apply Sorting
    if (filters.descSort && filters.descSort !== 'all') {
        finalQuery += filters.descSort === 'aToZ' ? ` ORDER BY Description ASC` : ` ORDER BY Bill_Id ASC`;
    } else if (filters.qtySort && filters.qtySort !== 'all') {
        finalQuery += filters.qtySort === 'maxMin' ? ` ORDER BY Qty DESC` : ` ORDER BY Qty ASC`;
    } else if (filters.amtSort && filters.amtSort !== 'all') {
        finalQuery += filters.amtSort === 'maxMin' ? ` ORDER BY Amount DESC` : ` ORDER BY Amount ASC`;
    } else {
        finalQuery += ` ORDER BY bill_date ASC, Bill_Id ASC`;
    }

    const result = await request.query(finalQuery);
    return result.recordset;
};

export const getCardTypes = async () => {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT cc_no, cc_name FROM cc_mast ORDER BY cc_name');
    return result.recordset;
};

export default {
    getBillReport,
    getItemReport,
    getCardTypes
};
