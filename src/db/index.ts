// External imports
import {PoolClient, Query, QueryResult} from "pg";

const { Pool } = require('pg')

const pool = new Pool()

module.exports = {
    query: async (text:string, params:any[]):Promise<Query> => {
        return await pool.query(text, params)
    },

    getClient: async ():Promise<PoolClient> => {
        return await pool.connect()
    }
}



