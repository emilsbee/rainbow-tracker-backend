// External imports
import {PoolClient, Query, QueryResult} from "pg";

const { Pool } = require('pg')

const pool = new Pool()

module.exports = {
    query: (text:string, params:any[], callback:(err:Error, res:QueryResult) => void):Query => {
        // const start = Date.now()
        // return pool.query(text, params,(err:Error, res:QueryResult) => {
        //     const duration = Date.now() - start
        //     console.log('executed query', {text, duration, rows:res.rowCount})
        //     callback(err, res)
        // })
        return pool.query(text, params)
    },

    getClient: (callback: (err:Error, client:PoolClient, release:(err:Error) => void) => void):PoolClient => {
        // pool.connect((err:Error, client:PoolClient, done:(err:Error) => void) => {
        //     callback(err, client, done)
        // })
        return pool.connect()
    }
}



