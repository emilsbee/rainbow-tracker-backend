// External imports
import fs from "fs"
import path from "path"

// Internal imports
import db from "../db/postgres"

/**
 * Drops and re-creates tables.
 */
export async function initialize ():Promise<void> {
    try {
        let initializeDatabase = fs.readFileSync(path.join(__dirname, "../db/tests/init-tests.sql")).toString();

        let queries:string[] = initializeDatabase.split(";")

        for (let i = 0; i < queries.length; i++) {
            if (queries[i].length > 0) {
                await db.query(queries[i]+";")
            }
        }
    } catch (e: any) {
        console.error(e.message)
    }
}

/**
 * Runs the given query.
 */
export async function initializeWithData (query: string):Promise<void> {
    try {
        let queries:string[] = query.split(";")

        for (let i = 0; i < queries.length; i++) {
            if (queries[i].length > 0) {
                await db.query(queries[i]+";")
            }
        }
    } catch (e: any) {
        console.error(e.message)
    }
}


