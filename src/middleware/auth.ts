// External imports
import {Context, Next} from "koa";
import {getUserRole} from "../dao/userDao";
import {roles} from "../constants/roles";

// Internal imports

export default {
    user: async (ctx:Context, next:Next):Promise<void> => {
        if (ctx.session.isNew) {
            ctx.throw(401)
        } else {
            await next()
        }
    },
    admin: async (ctx:Context, next:Next):Promise<void> => {
        if (ctx.session.isNew) {
            ctx.throw(401)
        } else {
            let role = await getUserRole(ctx.session.userid)

            if (role !== roles.ADMIN) {
                ctx.throw(403)
            }  else {
                await next()
            }
        }
    }
}
