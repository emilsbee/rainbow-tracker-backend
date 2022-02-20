import fs from 'fs';
import { PoolClient, QueryResult, Pool } from 'pg';

const pgpassword = process.env.PGPASSWORD;
const pguser = process.env.PGUSER;
const pghost = process.env.PGHOST;
const pgdatabase = process.env.PGDATABASE;
const pgport = process.env.PGPORT;


const pool = new Pool({
    password: pgpassword,
    user: pguser,
    host: pghost,
    database: pgdatabase,
    port: pgport ? parseInt(pgport) : 5432,
    ssl: {
        ca: process.env.NODE_ENV === 'production'
            ? process.env.CA_CERT
            : fs.readFileSync('./ca-certificate.cer').toString(),
        rejectUnauthorized: false,
    },
});

export default {
    query: async (text:string | {name:string, text:string, values:any[]}, params?:any[]):Promise<QueryResult> => {
        return pool.query(text, params);
    },

    getClient: async ():Promise<PoolClient> => {
        return await pool.connect();
    },
};

