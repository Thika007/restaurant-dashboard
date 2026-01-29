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
                            ELSE t.type_code 
                        END
                    FROM bill_tran t 
                    LEFT JOIN cc_mast cc ON LTRIM(RTRIM(t.key_code)) = LTRIM(RTRIM(cc.cc_no))
                    WHERE t.bill_no = h.bill_no 
                    AND t.type_code IN ('MM', 'CC', 'CS', 'CP', 'R', 'CO', 'VV', 'XX', 'ST')
                )
            END as Transaction_Type,
            CASE 
                WHEN h.bill_valid = 'X' THEN 'X'
                WHEN EXISTS (SELECT 1 FROM bill_tran t2 WHERE t2.bill_no = h.bill_no AND t2.tran_valid = 'Y') THEN 'Y'
                ELSE (SELECT TOP 1 t.type_code FROM bill_tran t WHERE t.bill_no = h.bill_no AND t.type_code IN ('MM', 'CC', 'CS', 'CP', 'R', 'CO', 'VV', 'XX', 'ST'))
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
            incomplete: ['Y']
        };

        const dbTxnTypes = [];
        filters.txnType.forEach(t => {
            if (txnMap[t]) dbTxnTypes.push(...txnMap[t]);
        });

        if (dbTxnTypes.length > 0) {
            const params = [];
            dbTxnTypes.forEach((val, i) => {
                const paramName = `txnType${i}`;
                request.input(paramName, sql.VarChar, val);
                params.push(`@${paramName}`);
            });
            finalQuery += ` AND Raw_Type IN (${params.join(',')})`;
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
    // Placeholder implementation for Item Report
    // This will be expanded when the Item Report feature is fully implemented
    return [];
};

export default {
    getBillReport,
    getItemReport
};
