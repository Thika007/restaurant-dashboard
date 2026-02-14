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
                            WHEN t.type_code IN ('R', 'RR') THEN 'Refund'
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
                    AND t.type_code IN ('MM', 'CC', 'CS', 'CP', 'R', 'RR', 'CO', 'VV', 'XX', 'ST', 'WA')
                    ORDER BY CASE 
                        WHEN t.type_code IN ('MM', 'CC', 'CS', 'CP', 'CO', 'ST') THEN 1 
                        ELSE 2 
                    END
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
                    WHERE t3.bill_no = h.bill_no AND t3.type_code IN ('MM', 'CC', 'CS', 'CP', 'R', 'RR', 'CO', 'VV', 'XX', 'ST', 'WA')
                    ORDER BY CASE 
                        WHEN t3.type_code IN ('MM', 'CC', 'CS', 'CP', 'CO', 'ST') THEN 1 
                        ELSE 2 
                    END
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
            refund: ['R', 'RR'],
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
            t.tran_code as Code,
            t.tran_desc as Description,
            SUM(
                CASE 
                    WHEN t.type_code IN ('VV', 'WA', 'CO', 'ST') AND t.unit_price > 0 THEN ABS(t.tran_amt2) / t.unit_price 
                    ELSE ISNULL(t.tran_qty, 0) 
                END
            ) as Qty,
            SUM(
                CASE 
                    WHEN t.type_code IN ('VV', 'WA', 'CO', 'ST', 'R', 'RR', 'RS') THEN ABS(t.tran_amt2)
                    ELSE ISNULL(t.tran_amt, 0)
                END
            ) as Amount,
            MAX(i.dept_code) as Dept_Code,
            MAX(i.class_id) as Class_id
        FROM bill_tran t
        INNER JOIN bill_header h ON t.bill_no = h.bill_no
        LEFT JOIN Item_mast i ON t.tran_code = i.barcode
        WHERE t.type_code IN ('RS', 'RR', 'VV', 'WA', 'CO', 'ST')
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

    // Apply Transaction Type Filter (via Raw_Type mapping logic)
    if (filters.txnType && !filters.txnType.includes('all')) {
        const txnMap = {
            cash: ['MM'],
            cardPay: ['CC'],
            credit: ['CS'],
            creditPaid: ['CP'],
            refund: ['R', 'RR'],
            complimentary: ['CO'],
            void: ['VV'],
            staff: ['ST'],
            cancel: ['X', 'XX'],
            incomplete: ['Y'],
            wastage: ['WA']
        };

        const directFilterMap = ['void', 'refund', 'wastage'];
        const dbTxnTypes = [];
        const dbAdjustmentTypes = [];
        const cardTypes = [];

        filters.txnType.forEach(t => {
            if (t.startsWith('CC_')) {
                cardTypes.push(t.substring(3));
            } else if (txnMap[t]) {
                if (directFilterMap.includes(t)) {
                    dbAdjustmentTypes.push(...txnMap[t]);
                } else {
                    dbTxnTypes.push(...txnMap[t]);
                }
            }
        });

        if (dbAdjustmentTypes.length > 0) {
            const params = [];
            dbAdjustmentTypes.forEach((val, i) => {
                const paramName = `adjType${i}`;
                request.input(paramName, sql.VarChar, val);
                params.push(`@${paramName}`);
            });
            query += ` AND t.type_code IN (${params.join(',')})`;
        }

        if (dbTxnTypes.length > 0 || cardTypes.length > 0) {
            let txnClause = '';
            if (dbTxnTypes.length > 0) {
                const params = [];
                dbTxnTypes.forEach((val, i) => {
                    const paramName = `txnType${i}`;
                    request.input(paramName, sql.VarChar, val);
                    params.push(`@${paramName}`);
                });
                txnClause = `EXISTS (SELECT 1 FROM bill_tran t2 WHERE t2.bill_no = h.bill_no AND t2.type_code IN (${params.join(',')}))`;
            }

            if (cardTypes.length > 0) {
                const cardParams = [];
                cardTypes.forEach((val, i) => {
                    const paramName = `cardType${i}`;
                    request.input(paramName, sql.VarChar, val);
                    cardParams.push(`@${paramName}`);
                });
                const cardClause = `EXISTS (SELECT 1 FROM bill_tran t3 WHERE t3.bill_no = h.bill_no AND t3.type_code = 'CC' AND LTRIM(RTRIM(t3.key_code)) IN (${cardParams.join(',')}))`;
                txnClause = txnClause ? `(${txnClause} OR ${cardClause})` : cardClause;
            }

            if (txnClause) {
                query += ` AND ${txnClause}`;
            }
        }
    }

    // Category and Sub-category filters
    if (filters.categories && !filters.categories.includes('all')) {
        const params = [];
        filters.categories.forEach((val, i) => {
            const paramName = `cat${i}`;
            request.input(paramName, sql.VarChar, val);
            params.push(`@${paramName}`);
        });
        query += ` AND i.dept_code IN (${params.join(',')})`;
    }

    if (filters.subCategories && !filters.subCategories.includes('all')) {
        const params = [];
        filters.subCategories.forEach((val, i) => {
            const paramName = `subCat${i}`;
            request.input(paramName, sql.VarChar, val);
            params.push(`@${paramName}`);
        });
        query += ` AND i.class_id IN (${params.join(',')})`;
    }

    // Search bar filter
    if (filters.itemName && filters.itemName.trim() !== '') {
        query += ` AND t.tran_desc LIKE @itemName`;
        request.input('itemName', sql.VarChar, `%${filters.itemName}%`);
    }

    query += ` GROUP BY t.tran_code, t.tran_desc`;

    // Sorting
    if (filters.descSort === 'aToZ') query += ` ORDER BY t.tran_desc ASC`;
    else if (filters.qtySort === 'maxMin') query += ` ORDER BY Qty DESC`;
    else if (filters.qtySort === 'minMax') query += ` ORDER BY Qty ASC`;
    else if (filters.amtSort === 'maxMin') query += ` ORDER BY Amount DESC`;
    else if (filters.amtSort === 'minMax') query += ` ORDER BY Amount ASC`;
    else query += ` ORDER BY Amount DESC`;

    const result = await request.query(query);
    return result.recordset;
};

export const getCategories = async () => {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT Dept_Code, Dept_Name FROM dept_mast ORDER BY Dept_Name');
    return result.recordset;
};

export const getSubCategories = async (deptCode) => {
    const pool = await getConnection();
    const request = pool.request();
    let query = 'SELECT DISTINCT Class_id, Class_Desc FROM class_mast';
    if (deptCode && deptCode !== 'all') {
        query += ' WHERE Dept_Code = @deptCode';
        request.input('deptCode', sql.VarChar, deptCode);
    }
    query += ' ORDER BY Class_Desc';
    const result = await request.query(query);
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
    getCategories,
    getSubCategories,
    getCardTypes
};
