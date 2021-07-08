// External imports
import {Client} from "pg";

const crypto = require("crypto")
import {v4 as uuid} from "uuid";

// Internal imports
import {User} from "../routes/admin/user";
const db = require("../db")

/**
 * Get user info.
 * @param userid of user for which to find info.
 * @return User object with password being null.
 */
export const getUserInfo = async (userid:string):Promise<{ status:number, user:User[] }> => {
    const getUserInfoQuery = {name: "fetch-user-info", text: "SELECT email, userid FROM app_user WHERE userid=$1", values: [userid]}
    try {
        let user = await db.query(getUserInfoQuery)

         return {status: 200, user: user.rows}
    } catch (e) {
        return {status: 404, user: []}
    }
}

/**
 * Creates a user with given email, password.
 * @param email of the user.
 * @param password of the user.
 */
export const createUser = async (email:string, password:string):Promise<{ status:number, user:User[] }> => {
    try {
        const createUserQuery = "INSERT INTO app_user(userid, email, password, salt) VALUES($1, $2, $3, $4);"
        let salt = crypto.randomBytes(16).toString('hex')
        let passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 50, 'sha512').toString('hex')
        let newUser = {
            userid: uuid(),
            email,
            password: "",
            salt: ""
        }
        const values = [newUser.userid, email, passwordHash, salt]
        await db.query(createUserQuery, values)
        return {status: 201, user:[newUser]}
    } catch (err) {
        return {status: 422, user:[]}
    }
}

/**
 * Deletes all rows related to the given user in all tables.
 * @param userid of the user to delete.
 */
export const deleteUser = async (userid:string):Promise<number> => {
    const client:Client = await db.getClient()

    try {
        // Begin transaction
        await client.query('BEGIN')

        const deleteUserRowsQuery = "DELETE FROM : WHERE userid = $1;"
        const tablesToDeleteFrom = ["activity_type", "analytics_activity", "analytics_category", "category", "category_type", "note", "week", "app_user"]

        for (let i = 0; i < tablesToDeleteFrom.length; i++) {
            let newQuery = deleteUserRowsQuery.replace(":", tablesToDeleteFrom[i])
            await db.query(newQuery, [userid])
        }

        // Commit transaction
        await client.query('COMMIT')

        return 204
    } catch (e) {
        await client.query('ROLLBACK')
        return 400
    } finally {
        await client.end()
    }
}
