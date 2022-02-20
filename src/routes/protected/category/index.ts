import * as i from "types";
import { Context } from "koa";
const Router = require("koa-router");

import contentType from "../../../middleware/contentType";
import { updateWeekDayCategories } from "../../../dao/categoryDao";

export const categoryRouter = new Router();

/**
 * Route for updating a given week day's categories. So all categories from a specific week
 * and a specific day are updated. To be more specific, the aspects of categories that are
 * updated are the categoryid and activityid. However, all the information of a category has to
 * be provided like the categoryPosition, weekid, etc.
 */
 categoryRouter.patch("/week/:weekid/day/:day/categories", contentType.JSON, async (ctx: Context) => {
    const weekid = ctx.params.weekid;
    const userid = ctx.state.user.userid;
    const day = ctx.params.day;
    const categoriesToUpdate = ctx.request.body as i.Category[];

    const { status, error, data: categories } = await updateWeekDayCategories(weekid, userid, categoriesToUpdate, day);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
    ctx.body = categories;
});
