import { Context } from "koa";
const Router = require("koa-router");

import { generateAccessToken, generateRefreshToken, validateRefreshToken } from "../../../services";
import contentType from "../../../middleware/contentType";
import { login } from "../../../dao/authDao";

const router = new Router();

router.post("/auth/login", contentType.JSON, async (ctx:Context) => {
    const { email, password } = ctx.request.body as {email:string, password:string};

    const { status, data: user, error } = await login(email, password);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    const accessToken: string = generateAccessToken({ userid: user.userid, active: true });
    const refreshToken: string = await generateRefreshToken(user.userid);

    ctx.status = status;
    ctx.body = { ...user, accessToken, refreshToken };
});

router.post("/auth/refresh", contentType.JSON, async (ctx: Context) => {
    const { refreshToken, userid } =  ctx.request.body as { refreshToken: string, userid: string };

    let accessToken: string;
    let status: number;

    const isValid = await validateRefreshToken(userid, refreshToken);

    if (isValid) {
        accessToken = await generateAccessToken({ userid, active: true });
        status = 200;
    } else {
        ctx.throw(401, "Invalid refresh token", { path: __filename });
    }

   ctx.body = { accessToken };
   ctx.status = status;
});

export  default router;
