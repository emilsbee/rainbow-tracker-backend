// External imports
import {Context, Next} from "koa";

// Internal imports

export default async (ctx:Context, next:Next) => {
    if (ctx.session.isNew) {
        ctx.throw(401)
    } else {
        await next()
    }
}
