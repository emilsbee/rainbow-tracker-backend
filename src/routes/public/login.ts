import { Context } from "koa";
const Router = require("koa-router");

import { generateAccessToken, generateRefreshToken, validateRefreshToken } from "services";
import { checkCredentials } from "dao";

import contentType from "../../middleware/contentType";

export const authPublicRouter = new Router();

authPublicRouter.post("/auth/jwt/create", contentType.JSON, async (ctx:Context) => {
    const { email, password } = ctx.request.body;

    const { status, data: user, error } = await checkCredentials({ email, password });

    if (error.length > 0 || !user) {
        ctx.throw(status, error);
    }

    const accessToken: string = generateAccessToken({ userid: user.userid, active: true });
    const refreshToken: string = await generateRefreshToken(user.userid);

    ctx.status = status;
    ctx.body = { ...user, accessToken, refreshToken };
});

authPublicRouter.post("/auth/jwt/refresh", contentType.JSON, async (ctx: Context) => {
    const { refreshToken } =  ctx.request.body as { refreshToken: string };

    if (!refreshToken) {
        ctx.throw(401, "Valid refresh token must be provided.");
    }

    const { userid, isValid } = await validateRefreshToken(refreshToken);

    if (!isValid || !userid) {
        ctx.throw(401, "Invalid refresh token");
    } else {
        const accessToken = await generateAccessToken({ userid, active: true });
        ctx.body = { accessToken };
        ctx.status = 200;
    }
});
