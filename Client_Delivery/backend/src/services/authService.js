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
    const result = await pool.request().query('SELECT DISTINCT LTRIM(RTRIM(location_id)) as location_id FROM [dbo].[user_file] WHERE location_id IS NOT NULL AND location_id <> \'\' ORDER BY location_id');
    return result.recordset.map(r => r.location_id);
};

export default {
    validateUser,
    getLocationIds
};
