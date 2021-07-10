// External imports
import {Context, Next} from "koa";
let Router = require('koa-router');
import {v4 as uuid} from "uuid";

// Internal
import contentType from "../../middleware/contentType";
import {login} from "../../dao/authDao";
import {SESSION_CONTEXT_OBJECT_NAME, SESSION_COOKIE_NAME, SESSION_EXPIRE_TIME_SECONDS} from "../../middleware/session";
import redisClient from "../../db/redis";

let router = new Router();

/**
 * Route for logging in with email and password. It calls a function to check for
 * credential validity, then depending on the result creates a session cookie and
 * saves the sessionid of the cookie in redis.
 * @return user
 */
router.post("/auth/login", contentType.JSON, async (ctx:Context, next:Next) => {
    const {email, password} = ctx.request.body as {email:string, password:string}
    let status:number;

    let user = await login(email, password)

    if (user.length !== 0 && ctx[SESSION_CONTEXT_OBJECT_NAME]) { // If a user was found and the session context was initialized
        ctx[SESSION_CONTEXT_OBJECT_NAME].userid = user[0].userid

        let sessionid = uuid()
        ctx.cookies.set(SESSION_COOKIE_NAME, sessionid)

        try {
            await redisClient.setex(sessionid, SESSION_EXPIRE_TIME_SECONDS,  JSON.stringify({userid: user[0].userid }))
            status = 200
        } catch (e) {
            console.error(e)
            status = 401
        }

    } else { // If no user was found in login or the session context wasn't initialized
        status = 401
    }

    ctx.status = status
    ctx.set("Content-Type", "application/json")
    ctx.body = user
})

export  default router