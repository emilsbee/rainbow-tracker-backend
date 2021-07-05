// External imports
import {Context, Next} from "koa";
import {getUserRole} from "../dao/userDao";
import {roles} from "../constants/roles";
import user from "../routes/user";

// Internal imports

export default {
    user: async (ctx:Context, next:Next):Promise<void> => {
        if (ctx.session.isNew) { // If not logged in
            ctx.throw(401)
        } else { // If logged in
            let useridFromParams = ctx.params.userid
            let userid = ctx.session.userid
            let role = await getUserRole(userid)

            if (role !== roles.ADMIN && useridFromParams && useridFromParams !== userid) { // If the actual userid (from session) isn't the same as userid provided in url params
                ctx.throw(403)
            } else {
                await next()
            }
        }
    },
    admin: async (ctx:Context, next:Next):Promise<void> => {
        if (ctx.session.isNew) { // If not logged in at all
            ctx.throw(401)
        } else { // If logged in
            let role = await getUserRole(ctx.session.userid)

            if (role !== roles.ADMIN) {
                ctx.throw(403)
            }  else {
                await next()
            }
        }
    }
}
