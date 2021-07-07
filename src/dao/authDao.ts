// External imports
import {Client, QueryResult} from "pg";

const crypto = require("crypto")

// Internal imports
import user, {User} from "../routes/admin/user"
const db = require("../db/index")

/**
 * Performs login by finding the appropriate user by email and then comparing the provided password
 * to the one in the database.
 * @param email of the user to login.
 * @param password of the user to login.
 */
export const login = async (email:string, password:string):Promise<{status:number, user:User[]}> => {
    const client:Client = await db.getClient()

    try {
        // Begin transaction
        await client.query('BEGIN')

        // Fetches the provided user by email
        const getUserPasswordQuery = "SELECT * FROM app_user WHERE email=$1"
        let userPassResult:QueryResult = await client.query(getUserPasswordQuery, [email])

        if (userPassResult.rowCount !== 0) { // If the provided email exists in the database and has a password

            let salt = userPassResult.rows[0].salt
            let passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 50, "sha512").toString('hex') // Recreates the hashed password with salt

            if (userPassResult.rows[0].password === passwordHash) { // Passwords match
                delete userPassResult.rows[0].password
                delete userPassResult.rows[0].salt
                return {status: 200, user:userPassResult.rows}
            } else { // Passwords don't match
                return {status:401, user:[]}
            }
        } else { // The provided email doesn't exist in the db
            return {status: 401, user:[]}
        }
    } catch (e) {
        return {status: 401, user:[]}
    } finally {
        await client.end()
    }
}