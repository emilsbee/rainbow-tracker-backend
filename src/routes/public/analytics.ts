// External imports
import {Context} from "koa";
let Router = require('koa-router');

// Internal imports
import protect from "../../middleware/auth";
import {
    getAvailableDates,
    getAvailableMonths,
    getTotalPerDay, getTotalPerDaySpecific,
    getTotalPerMonth,
    getTotalPerWeek
} from "../../dao/analyticsDao/analyticsDao";
import {getWeekId} from "../../dao/weekDao/weekDao";

const router = new Router()

/**
 * Route for fetching analytics for a single specific day.
 */
router.get("/analytics/total-per-day/:day", protect.user, async (ctx: Context) => {
    const userid = ctx.params.userid
    const day = ctx.params.day
    const weekNr = ctx.request.query.week_number as string
    const weekYear = ctx.request.query.week_year as string

    const {status, error, totalPerDaySpecific} = await getTotalPerDaySpecific(userid, parseInt(day), parseInt(weekNr), parseInt(weekYear))

    if (error.length > 0) {
        ctx.throw(status, error, {path: __filename})
    }

    ctx.status = status
    ctx.body = totalPerDaySpecific
})

/**
 * Route for fetching the total per day for categories and activities.
 */
router.get("/analytics/total-per-day", protect.user, async (ctx: Context) => {
    const userid = ctx.params.userid
    const weekNr = ctx.request.query.week_number as string
    const weekYear = ctx.request.query.week_year as string

    const weekidRes: {weekid: string | null, error: string} = await getWeekId(parseInt(weekNr), parseInt(weekYear), userid)

    if (weekidRes.weekid == null) {
        ctx.throw(404, weekidRes.error, {path: __filename})
    } else {
        const {status, error, totalPerDay} = await getTotalPerDay(userid, weekidRes.weekid)

        if (error.length > 0) {
            ctx.throw(status, error, {path: __filename})
        }

        ctx.status = status
        ctx.body = totalPerDay
    }
})

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

/**
 * Route for fetching the years and weeks which the user has populated. So if the user only has one
 * week created which is week 32, 2020, then an object containing week 32 and year 2020 will be returned.
 */
router.get("/analytics/available-dates", protect.user, async (ctx: Context) => {
    const userid = ctx.params.userid

    const {status, error, availableDates} = await getAvailableDates(userid)

    if (error.length > 0) {
        ctx.throw(status, error, {path: __filename})
    }

    ctx.status = status
    ctx.body = availableDates
})

router.get("/analytics/available-months", protect.user, async (ctx: Context) => {
    const userid = ctx.params.userid

    const {status, error, availableMonths} = await getAvailableMonths(userid)

    if (error.length > 0) {
        ctx.throw(status, error, {path: __filename})
    }

    ctx.status = status
    ctx.body = availableMonths
})

router.get("/analytics/total-per-month", protect.user, async (ctx: Context) => {
    const userid = ctx.params.userid
    const month = ctx.request.query.month as string
    const year = ctx.request.query.year as string

    const {status, error, totalPerMonth} = await getTotalPerMonth(userid, parseInt(month), parseInt(year))

    if (error.length > 0) {
        ctx.throw(status, error, {path: __filename})
    }

    ctx.status = status
    ctx.body = totalPerMonth
})

export default router