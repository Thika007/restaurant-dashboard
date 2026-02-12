import { getConnection } from '../config/db.js';
import sql from 'mssql';

export const getTodayStats = async (locationId) => {
    const pool = await getConnection();
    const today = new Date().toISOString().split('T')[0];

    const request = pool.request()
        .input('today', sql.Date, today);

    let locFilter = "";
    if (locationId && String(locationId).trim() !== '000') {
        const trimmedLocId = String(locationId).trim();
        locFilter = ` AND LTRIM(RTRIM(loc_id)) = @locationId`;
        request.input('locationId', sql.VarChar, trimmedLocId);
    }

    let query = `
        SELECT 
            (SELECT ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN bill_amt ELSE 0 END), 0) FROM bill_header WHERE CAST(bill_date AS DATE) = @today ${locFilter}) as total_revenue,
            (SELECT ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN bill_amt - tax - Service_charge_Amt ELSE 0 END), 0) FROM bill_header WHERE CAST(bill_date AS DATE) = @today ${locFilter}) as net_revenue,
            (SELECT ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN Service_charge_Amt ELSE 0 END), 0) FROM bill_header WHERE CAST(bill_date AS DATE) = @today ${locFilter}) as total_service_charge,
            (SELECT COUNT(DISTINCT CASE WHEN bill_valid != 'X' AND Service_charge_Amt > 0 THEN bill_no END) FROM bill_header WHERE CAST(bill_date AS DATE) = @today ${locFilter}) as service_charge_count,
            (SELECT ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN ABS(Discount_Amt) ELSE 0 END), 0) FROM bill_header WHERE CAST(bill_date AS DATE) = @today ${locFilter}) as total_discount,
            (SELECT COUNT(DISTINCT CASE WHEN bill_valid != 'X' AND ABS(Discount_Amt) > 0 THEN bill_no END) FROM bill_header WHERE CAST(bill_date AS DATE) = @today ${locFilter}) as discount_count,
            (SELECT COUNT(CASE WHEN bill_valid != 'X' THEN bill_no END) FROM bill_header WHERE CAST(bill_date AS DATE) = @today ${locFilter}) as bill_count,
            (SELECT ISNULL(SUM(CASE WHEN bill_valid = 'X' THEN bill_amt ELSE 0 END), 0) FROM bill_header WHERE CAST(bill_date AS DATE) = @today ${locFilter}) as cancelled_amount,
            (SELECT COUNT(CASE WHEN bill_valid = 'X' THEN 1 END) FROM bill_header WHERE CAST(bill_date AS DATE) = @today ${locFilter}) as cancelled_count,
            (SELECT ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN No_Of_Pax ELSE 0 END), 0) FROM bill_header WHERE CAST(bill_date AS DATE) = @today ${locFilter}) as guest_count,
            
            (SELECT ISNULL(SUM(ABS(t.tran_amt2)), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE CAST(h.bill_date AS DATE) = @today AND h.bill_valid != 'X' AND t.type_code IN ('R', 'RR') ${locFilter.replace('loc_id', 'h.loc_id')}) as refund_amount,
            (SELECT ISNULL(SUM(ABS(t.tran_qty)), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE CAST(h.bill_date AS DATE) = @today AND h.bill_valid != 'X' AND t.type_code IN ('R', 'RR') ${locFilter.replace('loc_id', 'h.loc_id')}) as refund_items_count,
            (SELECT COUNT(DISTINCT t.bill_no) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE CAST(h.bill_date AS DATE) = @today AND h.bill_valid != 'X' AND t.type_code IN ('R', 'RR') ${locFilter.replace('loc_id', 'h.loc_id')}) as refund_count,
            
            (SELECT ISNULL(SUM(ABS(t.tran_amt2)), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE CAST(h.bill_date AS DATE) = @today AND h.bill_valid != 'X' AND t.type_code = 'VV' ${locFilter.replace('loc_id', 'h.loc_id')}) as void_amount,
            (SELECT ISNULL(SUM(ABS(t.tran_qty)), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE CAST(h.bill_date AS DATE) = @today AND h.bill_valid != 'X' AND (t.type_code = 'RS' OR t.tran_type = 'S') AND EXISTS (SELECT 1 FROM bill_tran t2 WHERE t2.bill_no = h.bill_no AND t2.type_code = 'VV') ${locFilter.replace('loc_id', 'h.loc_id')}) as void_items_count,
            (SELECT COUNT(DISTINCT t.bill_no) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE CAST(h.bill_date AS DATE) = @today AND h.bill_valid != 'X' AND t.type_code = 'VV' ${locFilter.replace('loc_id', 'h.loc_id')}) as void_count,
            
            (SELECT ISNULL(SUM(ABS(t.tran_amt2)), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE CAST(h.bill_date AS DATE) = @today AND h.bill_valid != 'X' AND t.type_code = 'CO' ${locFilter.replace('loc_id', 'h.loc_id')}) as complimentary_amount,
            (SELECT COUNT(DISTINCT t.bill_no) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE CAST(h.bill_date AS DATE) = @today AND h.bill_valid != 'X' AND t.type_code = 'CO' ${locFilter.replace('loc_id', 'h.loc_id')}) as complimentary_count,
            
            (SELECT ISNULL(SUM(ABS(t.tran_amt2)), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE CAST(h.bill_date AS DATE) = @today AND h.bill_valid != 'X' AND t.type_code = 'ST' ${locFilter.replace('loc_id', 'h.loc_id')}) as staff_amount,
            (SELECT COUNT(DISTINCT t.bill_no) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE CAST(h.bill_date AS DATE) = @today AND h.bill_valid != 'X' AND t.type_code = 'ST' ${locFilter.replace('loc_id', 'h.loc_id')}) as staff_count,
            
            (SELECT ISNULL(SUM(ABS(t.tran_amt2)), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE CAST(h.bill_date AS DATE) = @today AND h.bill_valid != 'X' AND t.type_code = 'WA' ${locFilter.replace('loc_id', 'h.loc_id')}) as waste_amount,
            (SELECT ISNULL(SUM(ABS(t.tran_qty)), 0) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE CAST(h.bill_date AS DATE) = @today AND h.bill_valid != 'X' AND (t.type_code = 'RS' OR t.tran_type = 'S') AND EXISTS (SELECT 1 FROM bill_tran t2 WHERE t2.bill_no = h.bill_no AND t2.type_code = 'WA') ${locFilter.replace('loc_id', 'h.loc_id')}) as waste_items_count,
            (SELECT COUNT(DISTINCT t.bill_no) FROM bill_tran t JOIN bill_header h ON t.bill_no = h.bill_no WHERE CAST(h.bill_date AS DATE) = @today AND h.bill_valid != 'X' AND t.type_code = 'WA' ${locFilter.replace('loc_id', 'h.loc_id')}) as waste_count,
            
            (SELECT ISNULL(SUM(CASE WHEN bill_valid != 'X' THEN tax ELSE 0 END), 0) FROM bill_header WHERE CAST(bill_date AS DATE) = @today ${locFilter}) as total_tax,
            (SELECT COUNT(DISTINCT CASE WHEN bill_valid != 'X' AND tax > 0 THEN bill_no END) FROM bill_header WHERE CAST(bill_date AS DATE) = @today ${locFilter}) as tax_count
    `;

    const result = await request.query(query);
    return result.recordset[0];
};

export default {
    getTodayStats
};
