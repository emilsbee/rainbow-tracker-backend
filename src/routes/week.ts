// External imports
import {Context, Next} from "koa";
let Router = require('koa-router');

// Internal imports
import contentType from "../middleware/contentType";
import protect from "../middleware/auth";
import {createWeek, getWeekByWeekid, getWeekId, updateWeekCategoriesByWeekid} from "../dao/weekDao/weekDao";

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
    categoryid:string,
    activityid:string
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
    const userid = ctx.session.userid
    let {weekNr, weekYear} = ctx.request.body as Week
    let {status, week} = await createWeek(weekNr, weekYear, userid)
    ctx.status = status
    ctx.set("Content-Type", "application/json")
    ctx.body = JSON.stringify(week)
})

/**
 * Router for updating a specific week's categories.
 */
router.put("/week/categories", contentType.JSON, protect.user, async (ctx:Context, next:Next) => {
    const userid = ctx.session.userid
    let week = ctx.request.body as {weekid:string, categories:Category[]}
    ctx.status = await updateWeekCategoriesByWeekid(week.weekid, userid, week.categories)
})

/**
 * Fetches a week and its categories and notes by a given weekNr and weekYear.
 * @return week with notes and categories organized in days.
 */
router.get("/week", protect.user, async (ctx:Context, next:Next) => {
    let userid = ctx.session.userid
    let weekNr = ctx.request.query.week_number as string
    let weekYear = ctx.request.query.week_year as string

    let weekid = null;
    if (weekNr && weekYear) {
        weekid = await getWeekId(parseInt(weekNr), parseInt(weekYear), userid)
    }

    if (weekid == null) {
        ctx.status = 404
    } else {
        let week:{status:number, week:FullWeek[]} = await getWeekByWeekid(weekid, userid)
        ctx.status = week.status
        ctx.set("Content-Type", "application/json")
        ctx.body = JSON.stringify(week.week)
    }
})

export default router