// External imports
import fs from "fs"
import path from "path"

// Internal imports
import db from "../db/postgres"

/**
 * Initializes database by running the init-tests.sql file which contains all the queries
 * necessary to prepare database structure and data for testing. Not only does it generate
 * the tables, but also inserts a tests user with email emils@gmail.com and password password.
 * After completing the database initialization it calls runTests function to run tests.
 */
export async function initialize ():Promise<void> {
    try {
        let initializeDatabase = fs.readFileSync(path.join(__dirname, "../db/init-tests.sql")).toString();

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


