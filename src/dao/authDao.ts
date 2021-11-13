import * as i from "types";
import { PoolClient, QueryResult } from "pg";
const crypto = require("crypto");

// Internal imports
import db from "../db/postgres";

/**
 * Performs login by finding the appropriate user by email and then comparing the provided password
 * to the one in the database.
 * @param email of the user to login.
 * @param password of the user to login.
 */
export const login = async (
    email:string,
    password:string,
):Promise<i.DaoResponse<i.User>> => {
    const client:PoolClient = await db.getClient();
    let user: i.User = {} as i.User;
    let error: string;

    try {
        // Begin transaction
        await client.query("BEGIN");

        // Fetches the provided user by email
        const getUserPasswordQuery = { name: "fetch-user", text: "SELECT * FROM app_user WHERE email=$1", values: [email] };
        const userPassResult:QueryResult = await client.query(getUserPasswordQuery);

        await client.query("COMMIT");

        if (userPassResult.rowCount !== 0) { // If the provided email exists in the database and has a password

            const salt = userPassResult.rows[0].salt;
            const passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 50, "sha512").toString("hex"); // Recreates the hashed password with salt

            if (userPassResult.rows[0].password === passwordHash) { // Passwords match
                // Deleting these properties because they are not needed for client
                delete userPassResult.rows[0].password;
                delete userPassResult.rows[0].salt;

                user = userPassResult.rows[0];
                error = "";
            } else { // Passwords don't match
                return {
                    data: user,
                    error: `Wrong password for user ${email}.`,
                    status: 401,
                };
            }
        } else { // The provided email doesn't exist in the db
            return {
                data: user,
                error: `No user with email ${email} found.`,
                status: 404,
            };
        }

        return { data: user, error, status: 200 };
    } catch (e: any) {
        await client.query("ROLLBACK");

        return { status: 400, data: user, error: e.message };
    } finally {
        client.release();
    }
};
