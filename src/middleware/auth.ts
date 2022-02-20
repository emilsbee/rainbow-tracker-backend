import { Context, Next } from "koa";

export const admin = async (ctx:Context, next:Next):Promise<void> => {
    const bearerToken = ctx.get("Authorization").split(" ")[1];

    if (bearerToken === process.env.TEMP_ACCESS_KEY) {
        await next();
    } else {
        ctx.throw(401, "Non-admin attempt to access admin protected resource.", { path: __filename });
    }
};
