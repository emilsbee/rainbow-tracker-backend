// External imports
import {Context, Next} from "koa";

const ContentType = {
    JSON: "application/json"
}

export default {
    JSON: async (ctx:Context, next:Next) => {
        if (ctx.req.headers["content-type"] === ContentType.JSON) {
            await next();
            ctx.set("Content-Type", "application/json; charset=utf-8")
        } else {
            ctx.throw(415, 'Content type must be application/json', {path: __filename})
        }
    }
}