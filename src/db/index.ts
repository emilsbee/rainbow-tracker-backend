// External imports
import {PoolClient, QueryResult} from "pg";

const { Pool } = require('pg')

// get the current environment
let env = process.env.NODE_ENV

// convert to uppercase
let envString:string
if (env) {
    envString = env.toUpperCase()
} else {
    throw new Error("You must have the environment variable NODE_ENV")
}

// access the environment variables for this environment
let pgpassword = process.env['PGPASSWORD_' + envString]
let pguser = process.env['PGUSER_' + envString]
let pghost = process.env['PGHOST_' + envString]
let pgdatabase = process.env['PGDATABASE_' + envString]
let pgport = process.env['PGPORT_' + envString]

const pool = new Pool({
    password: pgpassword,
    user: pguser,
    host: pghost,
    database: pgdatabase,
    port: pgport
})



export default {
    query: async (text:string | {name:string, text:string, values:any[]}, params?:any[]):Promise<QueryResult> => {
        return pool.query(text, params);
    },

    getClient: async ():Promise<PoolClient> => {
        return await pool.connect()
    }
}







