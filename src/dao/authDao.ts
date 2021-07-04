// External imports
const crypto = require("crypto")

// Internal imports
import {User} from "../routes/user"
const db = require("../db/index")

/**
 * Performs login by finding the appropriate user by email and then comparing the provided password
 * to the one in the database.
 * @param email of the user to login.
 * @param password of the user to login.
 */
export const login = async (email:string, password:string):Promise<{status:number, user:User[]}> => {
    try {
        const findUserQuery = "SELECT * FROM app_user WHERE email=$1 AND password=$2;"
        let passwordHash = crypto.pbkdf2Sync(password, process.env.SALT, 1000, 50, "sha512").toString()
        const values = [email, passwordHash]

        let user = await db.query(findUserQuery, values)

        if (user.rowCount !== 0) {
            delete user.rows[0].password
            return {status: 200, user:user.rows}
        } else {
            return {status: 401, user:[]}
        }
    } catch (e) {
        return {status: 401, user:[]}
    }
}