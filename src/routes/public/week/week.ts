// External imports
import {Context, Next} from "koa";
import Router from "koa-router"

// Internal imports
import contentType from "../../../middleware/contentType";
import protect from "../../../middleware/auth";
import {createWeek, getWeekByWeekid, getWeekId} from "../../../dao/weekDao/weekDao";
import categoryRouter from "./category/category"
import noteRouter from "./note/note"

let router = new Router(); // Initialize router

/**
 *  Sets up weekRoute's children routes.
 */
router.use("/week/:weekid/day/:day", categoryRouter.routes(), categoryRouter.allowedMethods())
router.use("/week/:weekid/day/:day", noteRouter.routes(), noteRouter.allowedMethods())

export type Note = {
    weekid: string,
    weekDay: number,
    notePosition: number,
    stackid: string,
    userid: string,
    note: string,
    weekDayDate: string
}

export type Category = {
    weekid: string,
    weekDay: number,
    categoryPosition: number,
    userid: string,
    categoryid: string | null,
    activityid: string | null,
    weekDayDate: string
}

export type Week = {
    weekid: string,
    userid: string,
    weekNr: number,
    weekYear: number
}

export type FullWeek = Week & { categories: Category[][], notes: Note[][] }

/**
 * Route for creating a week with a given query parameters week_number and week_year.
 * Also, generates the week's categories and notes.
 * @return week with notes and categories organized in days.
 */
router.post("/weeks", contentType.JSON, protect.user, async (ctx: Context) => {
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
 * Fetches a week and its categories and notes by a given weekNr and weekYear.
 * @return week with notes and categories organized in days.
 */
router.get("/week", protect.user, async (ctx: Context) => {
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