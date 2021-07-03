// External imports
const crypto = require("crypto")
import {v4 as uuid} from "uuid";

// Internal imports
import {User} from "../routes/user";
const db = require("../db")

/**
 * Get user info.
 * @param userid of user for which to find info.
 * @return User object with password being null.
 */
export const getUserInfo = async (userid:string):Promise<{ status:number, user:User[] }> => {
    const getUserInfoQuery = {name: "fetch-user-info", text: "SELECT email, role, userid FROM app_user WHERE userid=$1", values: [userid]}
    try {
        let user = await db.query(getUserInfoQuery)

         return {status: 200, user: user.rows}
    } catch (e) {
        return {status: 404, user: []}
    }
}

/**
 * Given a userid the user's role is found.
 * @param userid of user to find the role.
 * @return role or null if the userid is invalid.
 */
export const getUserRole = async (userid:string):Promise<string> => {
    let userRoleQueryValues = [userid]
    const getUserRoleQuery = {name: "fetch-user-role", text: "SELECT role FROM app_user WHERE app_user.userid=$1", values: userRoleQueryValues}

    try {
        let role = await db.query(getUserRoleQuery)

        if (role.rowCount === 0) {
            return null
        } else {
            return role.rows[0].role
        }
    } catch (e) {
        return null
    }
}

/**
 * Creates a user with given email, password and role.
 * @param email of the user.
 * @param password of the user.
 * @param role of the user.
 */
export const createUser = async (email:string, password:string, role:string):Promise<number> => {
    try {
        const createUserQuery = "INSERT INTO app_user(userid, email, password, role) VALUES($1, $2, $3, $4);"

        let passwordHash = crypto.pbkdf2Sync(password, process.env.SALT, 1000, 50, 'sha512').toString()
        const values = [uuid(), email, passwordHash,role]
        await db.query(createUserQuery, values)

        return 201
    } catch (err) {
        return 422
    }
}
