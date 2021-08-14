// External imports
import newman, {NewmanRunSummary} from "newman"
import fs from "fs"
import path from "path"

// Internal imports
import db from "../db/postgres"

let initializeDatabase = fs.readFileSync(path.join(__dirname, "../db/init-tests.sql")).toString();

/**
 * Initializes database by running the init-tests.sql file which contains all the queries
 * necessary to prepare database structure and data for testing. Not only does it generate
 * the tables, but also inserts a test user with email emils@gmail.com and password password.
 * After completing the database initialization it calls runTests function to run tests.
 */
export async function initialize (cb: (success:boolean) => void):Promise<void> {
    try {
        let queries:string[] = initializeDatabase.split(";")

        for (let i = 0; i < queries.length; i++) {
            if (queries[i].length > 0) {
                await db.query(queries[i]+";")
            }
        }
    } catch (e) {
        cb(false)
    }

    runTests(cb)
}

/**
 * Runs postman tests with newman.
 * @param cb the callback that indicates success or failure.
 */
function runTests (cb: (success:boolean) => void):void {
    newman.run({
        collection: require("./postman/collection.json"),
        environment: require("./postman/environment.json"),
        reporters: 'json',
        reporter: {
            json: {
                export: "./src/test/reports"
            }
        }
    }, (err:Error | null, summary: NewmanRunSummary)  => {
        if (err) {
            cb(false)
        }
        cb(summary.run.failures.length === 0)
    })
}
