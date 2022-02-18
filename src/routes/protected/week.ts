import * as i from "types";
import { Context } from "koa";
import Router from "koa-router";

import contentType from "../../middleware/contentType";
import { createWeek, getWeekByWeekid, getWeekId } from "../../dao/weekDao";

const router = new Router(); // Initialize router

/**
 * Route for creating a week with a given query parameters week_number and week_year.
 * Also, generates the week's categories and notes.
 * @return week with notes and categories organized in days.
 */
router.post("/weeks", contentType.JSON, async (ctx: Context) => {
    const userid = ctx.state.user.userid;
    const { weekNr, weekYear } = ctx.request.body as i.Week;
    const { status, data: week, error } = await createWeek(weekNr, weekYear, userid);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
    ctx.body = week;
});

router.get("/week", async (ctx: Context) => {
    const userid = ctx.state.user.userid;
    const weekNr = ctx.request.query.week_number as string;
    const weekYear = ctx.request.query.week_year as string;

    const { data: weekid, error: weekIdError, status } = await getWeekId(parseInt(weekNr), parseInt(weekYear), userid);

    if (weekIdError.length > 0 || weekid == null) {
        ctx.throw(status, weekIdError, { path: __filename });
    } else {
        const { data: week, status, error: weekError } = await getWeekByWeekid(weekid, userid);

        if (weekError.length > 0) {
            ctx.throw(status, weekError, { path: __filename });
        }

        ctx.status = status;
        ctx.body = week;
    }
});

export default router;
