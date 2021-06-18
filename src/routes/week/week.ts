// External imports
import {Context, Next} from "koa";
let Router = require('koa-router');

// Internal imports
import contentType from "../../middleware/contentType";
import protect from "../../middleware/auth";
import {createWeek, getWeekByWeekid, getWeekId} from "./helpers";

let router = new Router(); // Initialize router

export type Note = {
    week_id:string,
    week_day:number,
    note_position:number,
    stack_id:string,
    user_id:string,
    note:string
}

export type Category = {
    week_id:string,
    week_day:number,
    category_position:number,
    user_id:string,
    category_id:string,
    activity_id:string
}

export type Week = {
    week_id:string,
    user_id:string,
    week_number:number,
    week_year:number
}

export type FullWeek = Week & {categories:Category[][], notes:Note[][]}

/**
 * Route for creating a week with a given week_number and week_year. Also, generates the week's
 * categories and notes.
 * @return week with notes and categories organized in days.
 */
router.post("/week", contentType.JSON, protect, async (ctx:Context, next:Next) => {
    const user_id = ctx.session.user_id
    let {week_number, week_year} = ctx.request.body as Week
    let {status, week} = await createWeek(week_number.toString(), week_year.toString(), user_id)
    ctx.status = status
    ctx.set("Content-Type", "application/json")
    ctx.week = JSON.stringify(week)
})

/**
 * Fetches a week and its categories and notes by a given week_number and week_year.
 * @return week with notes and categories organized in days.
 */
router.get("/week", protect, async (ctx:Context, next:Next) => {
    let week_number = ctx.request.query.week_number
    let week_year = ctx.request.query.week_year
    let user_id = ctx.session.user_id

    let week_id = null;
    if (week_number && week_year) {
        // Here the week_number and week_year are string because they are extracted as strings from the request
        week_id = await getWeekId(week_number.toString(), week_year.toString(), user_id)
    }

    if (week_id == null) {
        ctx.status = 404
    } else {
        let week:{status:number, week:FullWeek[]} = await getWeekByWeekid(week_id, user_id)
        ctx.status = week.status
        ctx.set("Content-Type", "application/json")
        ctx.body = JSON.stringify(week.week)
    }
})

export default router