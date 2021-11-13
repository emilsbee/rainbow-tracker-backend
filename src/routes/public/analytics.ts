import * as i from "types";
import { Context } from "koa";
const Router = require("koa-router");

import protect from "../../middleware/auth";
import {
    getAvailableDates,
    getAvailableMonths,
    getTotalPerDay, getTotalPerDaySpecific,
    getTotalPerMonth,
    getTotalPerWeek,
} from "../../dao/analyticsDao/analyticsDao";
import { getWeekId } from "../../dao/weekDao/weekDao";

const router = new Router();

/**
 * Route for fetching analytics for a single specific day.
 */
router.get("/analytics/total-per-day/:day", protect.user, async (ctx: Context) => {
    const userid = ctx.params.userid;
    const day = ctx.params.day;
    const weekNr = ctx.request.query.week_number as string;
    const weekYear = ctx.request.query.week_year as string;

    const { status, error, data: totalPerDaySpecific } = await getTotalPerDaySpecific(userid, parseInt(day), parseInt(weekNr), parseInt(weekYear));

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
    ctx.body = totalPerDaySpecific;
});

/**
 * Route for fetching the total per day for categories and activities.
 */
router.get("/analytics/total-per-day", protect.user, async (ctx: Context) => {
    const userid = ctx.params.userid;
    const weekNr = ctx.request.query.week_number as string;
    const weekYear = ctx.request.query.week_year as string;

    const { data: weekid, error: weekIdError, status } = await getWeekId(parseInt(weekNr), parseInt(weekYear), userid);

    if (weekIdError.length > 0 || weekid == null) {
        ctx.throw(status, weekIdError, { path: __filename });
    } else {
        const { status, error: TotalPerDayError, data: totalPerDay } = await getTotalPerDay(userid, weekid);

        if (TotalPerDayError.length > 0) {
            ctx.throw(status, TotalPerDayError, { path: __filename });
        }

        ctx.status = status;
        ctx.body = totalPerDay;
    }
});

/**
 * Route for fetching the total time for each category, activity type in a given week by week number and year.
 */
router.get("/analytics/total-per-week", protect.user, async (ctx:Context) => {
    const userid = ctx.params.userid;
    const weekNr = ctx.request.query.week_number as string;
    const weekYear = ctx.request.query.week_year as string;

    const { data: weekid, error: weekIdError, status } = await getWeekId(parseInt(weekNr), parseInt(weekYear), userid);

    if (weekIdError.length > 0 || weekid == null) {
        ctx.throw(status, weekIdError, { path: __filename });
    } else {
        const { status, error: TotalPerWeekError, data: totalPerWeek } = await getTotalPerWeek(userid, weekid);

        if (TotalPerWeekError.length > 0) {
            ctx.throw(status, TotalPerWeekError, { path: __filename });
        }

        ctx.status = status;
        ctx.body = totalPerWeek;
    }
});

/**
 * Route for fetching the years and weeks which the user has populated. So if the user only has one
 * week created which is week 32, 2020, then an object containing week 32 and year 2020 will be returned.
 */
router.get("/analytics/available-dates", protect.user, async (ctx: Context) => {
    const userid = ctx.params.userid;

    const { status, error, data: availableDates } = await getAvailableDates(userid);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
    ctx.body = availableDates;
});

router.get("/analytics/available-months", protect.user, async (ctx: Context) => {
    const userid = ctx.params.userid;

    const { status, error, data: availableMonths } = await getAvailableMonths(userid);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
    ctx.body = availableMonths;
});

router.get("/analytics/total-per-month", protect.user, async (ctx: Context) => {
    const userid = ctx.params.userid;
    const month = ctx.request.query.month as string;
    const year = ctx.request.query.year as string;

    const { status, error, data: totalPerMonth } = await getTotalPerMonth(userid, parseInt(month), parseInt(year));

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
    ctx.body = totalPerMonth;
});

export default router;
