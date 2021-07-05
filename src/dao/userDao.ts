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
export const createUser = async (email:string, password:string, role:string):Promise<{ status:number, user:User[] }> => {
    try {
        const createUserQuery = "INSERT INTO app_user(userid, email, password, role) VALUES($1, $2, $3, $4);"
        let salt = crypto.randomBytes(48).toString('hex')
        let passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 50, 'sha512').toString()
        let newUser = {
            userid: uuid(),
            email,
            role,
            password: ""
        }
        const values = [newUser.userid, email, passwordHash+":"+salt, role]
        await db.query(createUserQuery, values)
        delete newUser.password
        return {status: 201, user:[newUser]}
    } catch (err) {
        return {status: 422, user:[]}
    }
}

/**
 * Deletes a user with given userid.
 * @param userid of the user to delete.
 */
export const deleteUser = async (userid:string):Promise<{status:number}> => {
    try {
        const deleteUserQuery = "DELETE FROM app_user, activity_type, analytics_activity, analytics_category, category, category_type, note, week WHERE userid=$1"

        let result = await db.query(deleteUserQuery, [userid])

        let status:number;
        if (result.rowCount === 0) {
            status = 404
        } else {
            status = 204
        }

        return {status}
    } catch (e) {
        console.log(e)
        return {status: 400}
    }
}
