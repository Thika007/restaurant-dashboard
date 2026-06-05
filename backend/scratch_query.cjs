const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'sqladmin',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'RESTDB_KIK',
    requestTimeout: 120000,
    connectionTimeout: 30000,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: true,
        cryptoCredentialsDetails: {
            minVersion: 'TLSv1'
        }
    }
};

async function run() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to DB');

        console.log('--- Item_mast columns ---');
        const res = await pool.request().query("SELECT TOP 1 * FROM Item_mast");
        console.log(res.recordset[0]);

        await pool.close();
    } catch (err) {
        console.error(err);
    }
}

run();

