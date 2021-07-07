// External imports
import {Context, Next} from "koa";
let Router = require('koa-router');

// Internal
import protect from "../../middleware/auth"

let router = new Router();

/**
 * Route for logging out.
 */
router.get("/auth/logout", protect.user, async (ctx:Context, next:Next) => {
    ctx.session = null
    ctx.status = 204
})

export default router