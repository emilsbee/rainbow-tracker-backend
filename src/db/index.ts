// External imports
import {PoolClient, Query} from "pg";

const { Pool } = require('pg')

// get the current environment
let env = process.env.NODE_ENV

// convert to uppercase
let envString = env.toUpperCase()

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

module.exports = {
    query: async (text:string, params:any[]):Promise<Query> => {
        return await pool.query(text, params)
    },

    getClient: async ():Promise<PoolClient> => {
        return await pool.connect()
    }
}



