// External imports
import {Context, Next} from "koa";
let Router = require('koa-router');

// Internal
import contentType from "../middleware/contentType";
import protect from "../middleware/auth"
import {login} from "../dao/authDao";

let router = new Router();

/**
 * Route for logging in with email and password.
 */
router.post("/auth/login", contentType.JSON, async (ctx:Context, next:Next) => {
    const {email, password} = ctx.request.body as {email:string, password:string}

    let {status, user} = await login(email, password)

    if (user.length !== 0) {
        ctx.session.userid = user[0].userid
    }

    ctx.status = status
    ctx.set("Content-Type", "application/json")
    ctx.body = user
})

/**
 * Route for logging out.
 */
router.get("/auth/logout", protect.user, async (ctx:Context, next:Next) => {
    ctx.session = null
    ctx.status = 204
})

export default router