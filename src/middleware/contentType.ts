// External imports
import {Context, Next} from "koa";

const ContentType = {
    JSON: "application/json"
}

export default {
    JSON: async (ctx:Context, next:Next) => {
        if (ctx.req.headers["content-type"] === ContentType.JSON) {
            await next();
        } else {
            ctx.throw(415)
        }
    }
}