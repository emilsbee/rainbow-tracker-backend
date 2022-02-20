import * as i from "types";
import { Context } from "koa";
import Router from "koa-router";
import { DateTime } from "luxon";

import { contentType } from "middleware";
import { createWeek, getWeekByWeekid, getWeekId } from "dao";

export const weekRouter = new Router(); // Initialize router

/**
 * Route for creating a week with a given query parameters week_number and week_year.
 * Also, generates the week's categories and notes.
 * @return week with notes and categories organized in days.
 */
 weekRouter.post("/weeks", contentType.JSON, async (ctx: Context) => {
    const userid = ctx.state.user.userid;
    const { weekNr, weekYear } = ctx.request.body as i.Week;
    const { status, data: week, error } = await createWeek(weekNr, weekYear, userid);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
    ctx.body = week;
});

weekRouter.get("/week", async (ctx: Context) => {
    const userid = ctx.state.user.userid;
    const weekNr = ctx.request.query.week_number as string;
    const weekYear = ctx.request.query.week_year as string;

    const { data: weekid, error: weekIdError, status, success } = await getWeekId(parseInt(weekNr), parseInt(weekYear), userid);

    if (!success) {
        ctx.throw(status, weekIdError);
    } else if (!weekid) {
        const maxDate = DateTime.now().plus({ years: 2 });
        const currentDate = DateTime.fromObject({ weekNumber: parseInt(weekNr), weekYear: parseInt(weekYear) });

        if (currentDate.toMillis() >= maxDate.toMillis()) {
            ctx.throw(400, "A week can be created maximums 2 years in the future.");
        } else {
            const { data, error: createWeekError, status: createWeekStatus } = await createWeek(parseInt(weekNr), parseInt(weekYear), userid);

            if (createWeekError.length > 0) {
                ctx.throw(createWeekStatus, createWeekError);
            }

            ctx.status = 200;
            ctx.body = data;
        }
    } else {
        const { data: week, status, error: weekError } = await getWeekByWeekid(weekid, userid);

        if (weekError.length > 0) {
            ctx.throw(status, weekError, { path: __filename });
        }

        ctx.status = status;
        ctx.body = week;
    }
});
