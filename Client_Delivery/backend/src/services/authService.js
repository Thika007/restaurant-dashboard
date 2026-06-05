import { getConnection } from '../config/db.js';
import sql from 'mssql';

export const validateUser = async (userId, password) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('userId', sql.VarChar, userId)
        .input('password', sql.VarChar, password)
        .query(`
            SELECT user_id, location_id, supervisor, alowmaster 
            FROM [dbo].[user_file] 
            WHERE user_id = @userId AND pword = @password
        `);

    const user = result.recordset[0];
    if (user && user.location_id) {
        user.location_id = user.location_id.trim();
    }
    return user;
};

export const getLocationIds = async () => {
    const pool = await getConnection();
    try {
        // 1. Try to get location IDs from Branch table (master data)
        const branchResult = await pool.request().query(`
            SELECT DISTINCT LTRIM(RTRIM(br_code)) as location_id 
            FROM Branch 
            WHERE br_code IS NOT NULL AND br_code <> ''
            ORDER BY location_id
        `);
        if (branchResult.recordset && branchResult.recordset.length > 0) {
            return branchResult.recordset.map(r => r.location_id);
        }
    } catch (e) {
        console.warn("Branch table lookup failed, trying History_header:", e.message);
    }

    try {
        // 2. Fallback to active transactions in History_header and bill_header
        const txResult = await pool.request().query(`
            SELECT DISTINCT LTRIM(RTRIM(loc_id)) as location_id 
            FROM History_header 
            WHERE loc_id IS NOT NULL AND loc_id <> ''
            UNION
            SELECT DISTINCT LTRIM(RTRIM(loc_id)) as location_id
            FROM bill_header
            WHERE loc_id IS NOT NULL AND loc_id <> ''
            ORDER BY location_id
        `);
        if (txResult.recordset && txResult.recordset.length > 0) {
            return txResult.recordset.map(r => r.location_id);
        }
    } catch (e) {
        console.warn("Transaction history lookup failed, trying user_file:", e.message);
    }

    // 3. Fallback to user_file
    const fallback = await pool.request().query(`
        SELECT DISTINCT LTRIM(RTRIM(location_id)) as location_id 
        FROM [dbo].[user_file] 
        WHERE location_id IS NOT NULL AND location_id <> '' 
        ORDER BY location_id
    `);
    return fallback.recordset.map(r => r.location_id);
};

export default {
    validateUser,
    getLocationIds
};
