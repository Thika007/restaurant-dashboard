import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'sqladmin',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'RESTDB_KIK',
    requestTimeout: 120000,
    connectionTimeout: 30000,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true', // false for local, true for azure
        trustServerCertificate: true,
        cryptoCredentialsDetails: {
            minVersion: 'TLSv1'
        }
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
                    ensureDatabaseIndexes(pool).catch(err => {
                        console.error('Failed to ensure database indexes:', err);
                    });
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

const ensureDatabaseIndexes = async (pool) => {
    try {
        console.log('Checking database indexes...');
        const request = pool.request();

        // 1. History_header index
        await request.query(`
            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_History_header_bill_date_loc_id' AND object_id = OBJECT_ID('History_header'))
            BEGIN
                CREATE NONCLUSTERED INDEX IX_History_header_bill_date_loc_id 
                ON History_header (bill_date, loc_id) 
                INCLUDE (bill_no, mech_no, bill_valid, bill_amt, tax, Service_charge_Amt, Discount_amt, No_Of_Pax, Ord_Type);
                PRINT 'Created index IX_History_header_bill_date_loc_id';
            END
        `);

        // 2. History_tran index
        await request.query(`
            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_History_tran_join_date_loc' AND object_id = OBJECT_ID('History_tran'))
            BEGIN
                CREATE NONCLUSTERED INDEX IX_History_tran_join_date_loc 
                ON History_tran (bill_date, Loc_id, mech_no, bill_no) 
                INCLUDE (tran_type, type_code, tran_qty, tran_amt, tran_amt2, unit_price, tran_desc, key_code, tran_valid);
                PRINT 'Created index IX_History_tran_join_date_loc';
            END
        `);

        // 3. bill_header index
        await request.query(`
            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_bill_header_bill_date_loc_id' AND object_id = OBJECT_ID('bill_header'))
            BEGIN
                CREATE NONCLUSTERED INDEX IX_bill_header_bill_date_loc_id 
                ON bill_header (bill_date, loc_id) 
                INCLUDE (bill_no, mech_no, bill_valid, bill_amt, tax, Service_charge_Amt, Discount_Amt, No_Of_Pax, Ord_Type);
                PRINT 'Created index IX_bill_header_bill_date_loc_id';
            END
        `);

        // 4. bill_tran index
        await request.query(`
            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_bill_tran_join_date_loc' AND object_id = OBJECT_ID('bill_tran'))
            BEGIN
                CREATE NONCLUSTERED INDEX IX_bill_tran_join_date_loc 
                ON bill_tran (bill_date, Loc_id, mech_no, bill_no) 
                INCLUDE (tran_type, type_code, tran_qty, tran_amt, tran_amt2, unit_price, tran_desc, key_code, tran_valid);
                PRINT 'Created index IX_bill_tran_join_date_loc';
            END
        `);

        console.log('Database index checks completed.');
    } catch (err) {
        console.error('Error during index checking/creation:', err);
    }
};

export default {
    getConnection,
    sql
};
