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

export default {
    validateUser
};
