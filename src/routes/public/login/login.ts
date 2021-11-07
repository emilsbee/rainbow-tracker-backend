// External imports
import { Context } from "koa";
const Router = require("koa-router");
import { v4 as uuid } from "uuid";

// Internal
import contentType from "../../../middleware/contentType";
import { login } from "../../../dao/authDao";
import { SESSION_CONTEXT_OBJECT_NAME, SESSION_COOKIE_NAME, SESSION_EXPIRE_TIME_SECONDS } from "../../../middleware/session";
import redisClient from "../../../db/redis";

const router = new Router();

/**
 * Route for logging in with email and password. It calls a function to check for
 * credential validity, then depending on the result creates a session cookie and
 * saves the sessionid of the cookie in redis.
 * @return user
 */
router.post("/auth/login", contentType.JSON, async (ctx:Context) => {
    const { email, password } = ctx.request.body as {email:string, password:string};

    const { status, data, error } = await login(email, password);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    } else {
        ctx[SESSION_CONTEXT_OBJECT_NAME].userid = data.userid;

        // Create a new session
        const sessionid = uuid();
        ctx.cookies.set(SESSION_COOKIE_NAME, sessionid);

        // Save the session information in Redis
        try {
            await redisClient.setex(sessionid, SESSION_EXPIRE_TIME_SECONDS,  JSON.stringify({ userid: data.userid }));
        } catch (e) {
            ctx.throw(500, "Redis could not save sessionid.", { path: __filename });
        }
    }

    ctx.status = status;
    ctx.body = data;
});

export  default router;
