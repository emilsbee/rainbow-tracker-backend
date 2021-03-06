import { Context } from 'koa';
const Router = require('koa-router');

import {
    getAvailableDates, getAvailableMonths, getTotalPerDay,
    getTotalPerDaySpecific, getTotalPerMonth, getTotalPerWeek,
    getWeekId,
} from 'dao';

export const analyticsRouter = new Router();

/**
 * Route for fetching analytics for a single specific day.
 */
 analyticsRouter.get('/analytics/total-per-day/:day', async (ctx: Context) => {
    const userid = ctx.state.user.userid;
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
 analyticsRouter.get('/analytics/total-per-day', async (ctx: Context) => {
    const userid = ctx.state.user.userid;
    const weekNr = ctx.request.query.week_number as string;
    const weekYear = ctx.request.query.week_year as string;

    const { data: weekid, error: weekIdError, status } = await getWeekId({ weekNr: parseInt(weekNr), weekYear: parseInt(weekYear), userid });

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
 analyticsRouter.get('/analytics/total-per-week', async (ctx:Context) => {
    const userid = ctx.state.user.userid;
    const weekNr = ctx.request.query.week_number as string;
    const weekYear = ctx.request.query.week_year as string;

    const { data: weekid, error: weekIdError, status } = await getWeekId({ weekNr: parseInt(weekNr), weekYear: parseInt(weekYear), userid });

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
 analyticsRouter.get('/analytics/available-dates', async (ctx: Context) => {
    const userid = ctx.state.user.userid;

    const { status, error, data: availableDates } = await getAvailableDates(userid);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
    ctx.body = availableDates;
});

analyticsRouter.get('/analytics/available-months', async (ctx: Context) => {
    const userid = ctx.state.user.userid;

    const { status, error, data: availableMonths } = await getAvailableMonths(userid);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
    ctx.body = availableMonths;
});

analyticsRouter.get('/analytics/total-per-month', async (ctx: Context) => {
    const userid = ctx.state.user.userid;
    const month = ctx.request.query.month as string;
    const year = ctx.request.query.year as string;

    const { status, error, data: totalPerMonth } = await getTotalPerMonth(userid, parseInt(month), parseInt(year));

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
    ctx.body = totalPerMonth;
});
