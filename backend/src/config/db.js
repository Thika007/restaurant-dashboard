import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'sqladmin',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'RESTDB28',
    options: {
        encrypt: true, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
};

let poolPromise;

export const getConnection = async () => {
    try {
        if (!poolPromise) {
            poolPromise = new sql.ConnectionPool(config)
                .connect()
                .then(pool => {
                    console.log('Connected to MSSQL');
                    return pool;
                })
                .catch(err => {
                    console.error('Database Connection Failed! Details:', {
                        message: err.message,
                        code: err.code,
                        config: { ...config, password: '****' }
                    });
                    poolPromise = null;
                    throw err;
                });
        }
        return poolPromise;
    } catch (err) {
        console.error('SQL Connection Error: ', err);
        throw err;
    }
};

export default {
    getConnection,
    sql
};
