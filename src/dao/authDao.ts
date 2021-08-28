// External imports
import {PoolClient, QueryResult} from "pg";
const crypto = require("crypto")

// Internal imports
import {User} from "../routes/admin/user"
import db from "../db/postgres"

/**
 * Performs login by finding the appropriate user by email and then comparing the provided password
 * to the one in the database.
 * @param email of the user to login.
 * @param password of the user to login.
 */
export const login = async (email:string, password:string):Promise<{ user:User[], error:string }> => {
    const client:PoolClient = await db.getClient()
    let user:User[];

    try {
        // Begin transaction
        await client.query('BEGIN')

        // Fetches the provided user by email
        const getUserPasswordQuery = {name: "fetch-user", text: "SELECT * FROM app_user WHERE email=$1", values: [email]}
        let userPassResult:QueryResult = await client.query(getUserPasswordQuery)

        if (userPassResult.rowCount !== 0) { // If the provided email exists in the database and has a password

            let salt = userPassResult.rows[0].salt
            let passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 50, "sha512").toString('hex') // Recreates the hashed password with salt

            if (userPassResult.rows[0].password === passwordHash) { // Passwords match
                // Deleting these properties because they are not needed for client
                delete userPassResult.rows[0].password
                delete userPassResult.rows[0].salt

                user = userPassResult.rows
            } else { // Passwords don't match
                user = []
            }
        } else { // The provided email doesn't exist in the db
            user = []
        }

        await client.query('COMMIT')

        return {user, error: ""}
    } catch (e: any) {
        await client.query('ROLLBACK')

        return {user: [], error: e.message}
    } finally {
        client.release()
    }
}