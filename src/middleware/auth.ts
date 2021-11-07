// External imports
import { Context, Next } from "koa";

// Internal imports
import { SESSION_CONTEXT_OBJECT_NAME } from "./session";

export default {
    user: async (ctx:Context, next:Next):Promise<void> => {
        if (!ctx[SESSION_CONTEXT_OBJECT_NAME] || ctx[SESSION_CONTEXT_OBJECT_NAME].isNew) { // If not logged in
            ctx.throw(401,  "Unauthenticated attempt to access user protected resource.", { path: __filename });
        } else { // If logged in
            const useridFromParams = ctx.params.userid;
            const userid = ctx[SESSION_CONTEXT_OBJECT_NAME].userid;

            if (useridFromParams !== userid) { // If the actual userid (from session) isn't the same as userid provided in url params
                ctx.throw(403, "Userid in params does not match the one of the user that made the request.", { path: __filename });
            } else {
                await next();
            }
        }
    },
    admin: async (ctx:Context, next:Next):Promise<void> => {
        const bearerToken = ctx.get("Authorization").split(" ")[1];

        if (bearerToken === process.env.TEMP_ACCESS_KEY) {
            await next();
        } else {
            ctx.throw(401, "Non-admin attempt to access admin protected resource.", { path: __filename });
        }
    },
};
