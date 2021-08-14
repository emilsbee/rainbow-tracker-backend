// External imports
import {Context, Next} from "koa";
let Router = require('koa-router');

// Internal imports
import protect from "../../middleware/auth";
import {getTotalPerWeek} from "../../dao/analytics";

const router = new Router()

router.get("/analytics/total-per-week/week/:weekid", protect.user, async (ctx:Context) => {
    const userid = ctx.params.userid
    const weekid = ctx.params.weekid

    const {status, error, totalPerWeek} = await getTotalPerWeek(userid, weekid)

    if (error.length > 0) {
        ctx.throw(status, error, {path: __filename})
    }

    ctx.status = status
    ctx.body = totalPerWeek
})

export default router