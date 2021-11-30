import { Context } from "koa";
const Router = require("koa-router");

import { removeRefreshToken } from "../../services";
import protect from "../../middleware/auth";

const router = new Router();

router.get("/auth/logout", async (ctx:Context) => {
    const userid = ctx.state.user.userid;

    await removeRefreshToken(userid);

    ctx.status = 204;
});

/**
 * Route for checking whether a user is currently logged in.
 */
router.get("/auth/is-logged-in", async (ctx:Context) => {
    ctx.status = 204;
});

export default router;
