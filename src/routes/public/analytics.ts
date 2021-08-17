// External imports
import {Context} from "koa";
let Router = require('koa-router');

// Internal imports
import protect from "../../middleware/auth";
import {getTotalPerWeek} from "../../dao/analytics";
import {getWeekId} from "../../dao/weekDao/weekDao";

const router = new Router()

/**
 * Route for fetching the total time for each category, activity type in a given week by week number and year.
 */
router.get("/analytics/total-per-week", protect.user, async (ctx:Context) => {
    const userid = ctx.params.userid
    const weekNr = ctx.request.query.week_number as string
    const weekYear = ctx.request.query.week_year as string

    const weekidRes: {weekid: string | null, error: string} = await getWeekId(parseInt(weekNr), parseInt(weekYear), userid)

    if (weekidRes.weekid == null) {
        ctx.throw(404, weekidRes.error, {path: __filename})
    } else {
        const {status, error, totalPerWeek} = await getTotalPerWeek(userid, weekidRes.weekid)

        if (error.length > 0) {
            ctx.throw(status, error, {path: __filename})
        }

        ctx.status = status
        ctx.body = totalPerWeek
    }
})

export default router