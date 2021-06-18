// External imports
import {Context, Next} from "koa";
const crypto = require("crypto")
let Router = require('koa-router');

// Internal
import contentType from "../middleware/contentType";
import protect from "../middleware/auth";
const db = require("../db/index")

let router = new Router(); // Initialize router

export type User = {
    user_id:string,
    email:string,
    password:string
}

/**
 * Create a user with given user_id, email, password.
 */
router.post('/user', contentType.JSON, protect, async  (ctx:Context, next:Next) => {
    let user = ctx.request.body as User

    try {
        const createUserQuery = "INSERT INTO users(user_id, email, password) VALUES($1, $2, $3);"

        let passwordHash = crypto.pbkdf2Sync(user.password, process.env.SALT, 1000, 50, 'sha512').toString()
        const values = [user.user_id, user.email, passwordHash]
        await db.query(createUserQuery, values)
        ctx.status = 201
    } catch (err) {
        ctx.status = 422
    }
});


export default router
