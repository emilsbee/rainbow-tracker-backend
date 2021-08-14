// External imports
import {Context} from "koa";
let Router = require('koa-router');

// Internal imports
import contentType from "../../../../middleware/contentType";
import protect from "../../../../middleware/auth";
import {updateWeekDayCategories} from "../../../../dao/categoryDao";
import {Category} from "../week";

let router = new Router(); // Initialize router

/**
 * Route for updating a given week day's categories. So all categories from a specific week
 * and a specific day are updated. To be more specific, the aspects of categories that are
 * updated are the categoryid and activityid. However, all the information of a category has to
 * be provided like the categoryPosition, weekid, etc.
 */
router.patch("/categories", contentType.JSON, protect.user, async (ctx: Context) => {
    let weekid = ctx.params.weekid
    let userid = ctx.params.userid
    let day = ctx.params.day
    let categories = ctx.request.body as unknown as Category[]

    let {status, error} = await updateWeekDayCategories(weekid, userid, categories, day)

    if (status === 400 || status === 404) {
        ctx.throw(status, error, {path: __filename})
    }

    ctx.status = status
})

export default router