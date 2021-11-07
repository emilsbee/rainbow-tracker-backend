// External imports
import { PoolClient } from "pg";
const crypto = require("crypto");
import { v4 as uuid } from "uuid";

// Internal imports
import { User } from "../routes/admin/user";
import db from "../db/postgres";

/**
 * Get user info.
 * @param userid of user for which to find info.
 * @return User object with password being null.
 */
export const getUserInfo = async (userid:string):Promise<{ status:number, user:User[], error:string }> => {
    const getUserInfoQuery = { name: "fetch-user-info", text: "SELECT email, userid FROM app_user WHERE userid=$1", values: [userid] };
    try {
        const user = await db.query(getUserInfoQuery);

         return { status: 200, user: user.rows, error: "" };
    } catch (e: any) {
        return { status: 400, user: [], error: e.message };
    }
};

/**
 * Creates a user with given email, password.
 * @param email of the user.
 * @param password of the user.
 */
export const createUser = async (email:string, password:string):Promise<{ status:number, user:User[], error:string}> => {
    try {
        const createUserQuery = "INSERT INTO app_user(userid, email, password, salt) VALUES($1, $2, $3, $4);";
        const salt = crypto.randomBytes(16).toString("hex");
        const passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 50, "sha512").toString("hex");
        const newUser = {
            userid: uuid(),
            email,
            password: "",
            salt: "",
        };
        const values = [newUser.userid, email, passwordHash, salt];
        await db.query(createUserQuery, values);
        return { status: 201, user: [newUser], error: "" };
    } catch (err: any) {
        return { status: 422, user: [], error: err.message };
    }
};

/**
 * Deletes all rows related to the given user in all tables.
 * @param userid of the user to delete.
 */
export const deleteUser = async (userid:string):Promise<{ status: number, error:string }> => {
    const client:PoolClient = await db.getClient();

    try {
        // Begin transaction
        await client.query("BEGIN");

        const deleteUserRowsQuery = "DELETE FROM : WHERE userid = $1;";
        const tablesToDeleteFrom = ["category", "note", "activity_type", "category_type", "week", "app_user"];

        for (let i = 0; i < tablesToDeleteFrom.length; i++) {
            const newQuery = deleteUserRowsQuery.replace(":", tablesToDeleteFrom[i]);
            await db.query(newQuery, [userid]);
        }

        // Commit transaction
        await client.query("COMMIT");

        return { status: 204, error: "" };
    } catch (e: any) {
        await client.query("ROLLBACK");
        return { status: 400, error: e.message };
    } finally {
        client.release();
    }
};
