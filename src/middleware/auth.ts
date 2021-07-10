// External imports
import {Context, Next} from "koa";

// Internal imports
import {SESSION_CONTEXT_OBJECT_NAME} from "./session";

export default {
    user: async (ctx:Context, next:Next):Promise<void> => {
        if (!ctx[SESSION_CONTEXT_OBJECT_NAME] || ctx[SESSION_CONTEXT_OBJECT_NAME].isNew) { // If not logged in
            ctx.throw(401)
        } else { // If logged in
            let useridFromParams = ctx.params.userid
            let userid = ctx[SESSION_CONTEXT_OBJECT_NAME].userid

            if (useridFromParams !== userid) { // If the actual userid (from session) isn't the same as userid provided in url params
                ctx.throw(403)
            } else {
                await next()
            }
        }
    },
    admin: async (ctx:Context, next:Next):Promise<void> => {
        let bearerToken = ctx.get('Authorization').split(" ")[1];

        if (bearerToken === process.env.TEMP_ACCESS_KEY) {
            await next()
        } else {
            ctx.throw(401)
        }
    }
}
