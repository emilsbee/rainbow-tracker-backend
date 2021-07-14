// External imports
import {Context, Next} from "koa";
let Router = require('koa-router');

// Internal imports
import contentType from "../../middleware/contentType";
import protect from "../../middleware/auth";
import {createWeek, getWeekByWeekid, getWeekId, updateWeekCategoriesByWeekid} from "../../dao/weekDao/weekDao";

let router = new Router(); // Initialize router

export type Note = {
    weekid:string,
    weekDay:number,
    notePosition:number,
    stackid:string,
    userid:string,
    note:string
}

export type Category = {
    weekid:string,
    weekDay:number,
    categoryPosition:number,
    userid:string,
    categoryid:string | null,
    activityid:string | null
}

export type Week = {
    weekid:string,
    userid:string,
    weekNr:number,
    weekYear:number
}

export type FullWeek = Week & {categories:Category[][], notes:Note[][]}

/**
 * Route for creating a week with a given week_number and week_year. Also, generates the week's
 * categories and notes.
 * @return week with notes and categories organized in days.
 */
router.post("/weeks", contentType.JSON, protect.user, async (ctx:Context, next:Next) => {
    const userid = ctx.params.userid
    let {weekNr, weekYear} = ctx.request.body as Week
    let {status, week, error} = await createWeek(weekNr, weekYear, userid)

    if (status === 400) {
        ctx.throw(status, error, {path: __filename})
    }

    ctx.status = status
    ctx.body = week
})

/**
 * Router for updating a specific week's categories.
 */
router.put("/week/:weekid/categories", contentType.JSON, protect.user, async (ctx:Context, next:Next) => {
    const userid = ctx.params.userid
    let weekid = ctx.params.weekid
    let week = ctx.request.body as {categories:Category[]}
    let {status, error} = await updateWeekCategoriesByWeekid(weekid, userid, week.categories)

    if (status === 400) {
        ctx.throw(status, error, {path: __filename})
    }

    ctx.status = status
})

/**
 * Fetches a week and its categories and notes by a given weekNr and weekYear.
 * @return week with notes and categories organized in days.
 */
router.get("/week", protect.user, async (ctx:Context, next:Next) => {
    let userid = ctx.params.userid
    let weekNr = ctx.request.query.week_number as string
    let weekYear = ctx.request.query.week_year as string

    let {weekid, error} = await getWeekId(parseInt(weekNr), parseInt(weekYear), userid)

    if (weekid == null) {
        ctx.throw(404, error, {path: __filename})
    } else {
        let {week, status, error} = await getWeekByWeekid(weekid, userid)

        if (status === 400) {
            ctx.throw(status, error, {path: __filename})
        }

        ctx.status = status
        ctx.body = week
    }
})

export default router