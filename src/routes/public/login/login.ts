import { Context } from "koa";
const Router = require("koa-router");

import { generateAccessToken, generateRefreshToken, validateRefreshToken } from "../../../services";
import contentType from "../../../middleware/contentType";
import { login } from "../../../dao/authDao";

const router = new Router();

router.post("/auth/jwt/create", contentType.JSON, async (ctx:Context) => {
    const { email, password } = ctx.request.body as {email:string, password:string};

    const { status, data: user, error } = await login(email, password);

    if (error.length > 0 || !user) {
        ctx.throw(status, error);
    }

    const accessToken: string = generateAccessToken({ userid: user.userid, active: true });
    const refreshToken: string = await generateRefreshToken(user.userid);

    ctx.status = status;
    ctx.body = { ...user, accessToken, refreshToken };
});

router.post("/auth/jwt/refresh", contentType.JSON, async (ctx: Context) => {
    const { refreshToken } =  ctx.request.body as { refreshToken: string, userid: string };

    const { userid, isValid } = await validateRefreshToken(refreshToken);

    if (!isValid || !userid) {
        ctx.throw(401, "Invalid refresh token");
    } else {
        const accessToken = await generateAccessToken({ userid, active: true });
        ctx.body = { accessToken };
        ctx.status = 200;
    }
});

export  default router;
