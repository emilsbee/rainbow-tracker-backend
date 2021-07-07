// External imports
import {Context, Next} from "koa";
let Router = require('koa-router');

// Internal
import contentType from "../../middleware/contentType";
import {login} from "../../dao/authDao";


let router = new Router();

/**
 * Route for logging in with email and password.
 */
router.post("/auth/login", contentType.JSON, async (ctx:Context, next:Next) => {
    const {email, password} = ctx.request.body as {email:string, password:string}

    let {status, user} = await login(email, password)

    if (user.length !== 0 && ctx.session) {
        ctx.session.userid = user[0].userid
    } else {
        status = 401
    }

    ctx.status = status
    ctx.set("Content-Type", "application/json")
    ctx.body = user
})

export  default router