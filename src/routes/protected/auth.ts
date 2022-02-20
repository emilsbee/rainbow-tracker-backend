import { Context } from "koa";
const Router = require("koa-router");

import { removeRefreshToken } from "services";

export const authRouter = new Router();

authRouter.get("/auth/logout", async (ctx:Context) => {
    const userid = ctx.state.user.userid;

    await removeRefreshToken(userid);

    ctx.status = 204;
});

/**
 * Route for checking whether a user is currently logged in.
 */
 authRouter.get("/auth/is-logged-in", async (ctx:Context) => {
    ctx.status = 204;
});
