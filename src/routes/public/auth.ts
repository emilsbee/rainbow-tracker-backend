// External imports
import { Context } from "koa";
const Router = require("koa-router");

// Internal
import protect from "../../middleware/auth";
import { SESSION_CONTEXT_OBJECT_NAME } from "../../middleware/session";

const router = new Router();

/**
 * Route for logging out.
 */
router.get("/auth/logout", protect.user, async (ctx:Context) => {
    ctx[SESSION_CONTEXT_OBJECT_NAME] = null;
    ctx.status = 204;
});

/**
 * Route for checking whether a user is currently logged in.
 */
router.get("/auth/is-logged-in", protect.user, async (ctx:Context) => {
    ctx.status = 204;
});

export default router;
