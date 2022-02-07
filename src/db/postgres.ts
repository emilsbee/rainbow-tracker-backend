import fs from "fs";
import { PoolClient, QueryResult, Pool } from "pg";

// get the current environment
const env = process.env.NODE_ENV;

// convert to uppercase to compare against env variables
let envString:string;
if (env) {
    envString = env.toUpperCase();
} else {
    throw new Error("You must have the environment variable NODE_ENV");
}

// access the environment variables for current environment
const pgpassword = process.env["PGPASSWORD_" + envString];
const pguser = process.env["PGUSER_" + envString];
const pghost = process.env["PGHOST_" + envString];
const pgdatabase = process.env["PGDATABASE_" + envString];
let pgport: string | undefined | number = process.env["PGPORT_" + envString];

if (pgport) {
    pgport = parseInt(pgport);
} else {
    throw new Error("Port provided for postgres is not valid.");
}

const pool = new Pool({
    connectionString: `postgresql://${pguser}:${pgpassword}@${pghost}:${pgport}/${pgdatabase}`,
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

