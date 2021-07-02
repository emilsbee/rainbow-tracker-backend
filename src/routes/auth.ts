// External imports
import {Context, Next} from "koa";
let Router = require('koa-router');
const crypto = require("crypto")

// Internal
import contentType from "../middleware/contentType";
import protect from "../middleware/auth"
const db = require("../db/index")

let router = new Router();

/**
 * Route for logging in with email and password.
 */
router.post("/auth", contentType.JSON, async (ctx:Context, next:Next) => {
    const {email, password} = ctx.request.body as {email:string, password:string}

    try {
        const findUserQuery = "SELECT * FROM app_user WHERE email=$1 AND password=$2;"
        let passwordHash = crypto.pbkdf2Sync(password, process.env.SALT, 1000, 50, "sha512").toString()
        const values = [email, passwordHash]
        let res = await db.query(findUserQuery, values)

        if (res.rowCount !== 0) {
            ctx.session.userid = res.rows[0].userid
            ctx.status = 200
        } else {
            ctx.status = 401
        }
    } catch (e) {
        console.log(e)
        ctx.status = 401
    }
})

/**
 * Route for logging out.
 */
router.get("/auth/logout", protect.user, async (ctx:Context, next:Next) => {
    ctx.session = null
    ctx.status = 204
})

export default router