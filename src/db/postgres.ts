import fs from "fs";
import { PoolClient, QueryResult, Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        ca: fs.readFileSync("./ca-certificate.cer").toString(),
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

