import * as i from "types";
import { PoolClient, QueryResult } from "pg";
const crypto = require("crypto");
import { v4 as uuid } from "uuid";

import db from "../db/postgres";

export const getUserInfo = async (userid:string):Promise<i.DaoResponse<i.User>> => {
    const getUserInfoQuery: i.QueryType = {
        name: "fetch-user-info",
        text: "SELECT email, userid FROM app_user WHERE userid=$1;",
        values: [userid],
    };

    let user:i.User = {} as i.User;

    try {
        const userQuery:QueryResult<i.User> = await db.query(getUserInfoQuery);

        if (userQuery.rowCount === 0) {
            return { status: 404, error: `Could not find user with userid ${userid}`, data: user };
        } else {
            user = userQuery.rows[0];
        }

        return { status: 200, data: user, error: "" };
    } catch (e: any) {
        return { status: 400, data: user, error: e.message };
    }
};

export const createUser = async (email:string, password:string):Promise<i.DaoResponse<i.User[]>> => {
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 50, "sha512").toString("hex");
    const newUser: i.User = {
        userid: uuid(),
        email,
        password: "",
        salt: "",
    };
    const createUserQuery: i.QueryType = {
        name: "Create user",
        text: "INSERT INTO app_user(userid, email, password, salt) VALUES($1, $2, $3, $4);",
        values: [newUser.userid, email, passwordHash, salt],
    };

    try {
        await db.query(createUserQuery);
        return { status: 201, data: [newUser], error: "" };
    } catch (err: any) {
        return { status: 422, data: [], error: err.message };
    }
};

export const deleteUser = async (userid:string):Promise<i.DaoResponse<null>> => {
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

        return { status: 204, error: "", data: null };
    } catch (e: any) {
        await client.query("ROLLBACK");
        return { status: 400, error: e.message, data: null };
    } finally {
        client.release();
    }
};
