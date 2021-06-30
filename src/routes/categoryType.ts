// External imports
import {Context, Next} from "koa";
let Router = require('koa-router');

// Internal imports
import contentType from "../middleware/contentType";
import protect from "../middleware/auth";
import {createCategoryType} from "../dao/categoryTypeDao";

let router = new Router()

export type CategoryType = {
    categoryid:string,
    userid:string,
    color:string,
    name:string,
    archived:boolean
}

export type ActivityType = {
    activityid:string,
    categoryid:string,
    userid:string,
    long:string,
    short:string,
    archived:boolean
}

/**
 * Route for creating a category type for a user.
 * @return categoryType the created category type object.
 */
router.post("/category-type", contentType.JSON, protect.user, async (ctx:Context, next:Next) => {
    const userid = ctx.session.userid
    let categoryTypeToCreate = ctx.request.body as CategoryType

    let color = categoryTypeToCreate.color
    let name = categoryTypeToCreate.name

    let {status, categoryType} = await createCategoryType(userid, color, name)

    ctx.status = status

    if (categoryType != null) {
        ctx.set("Content-Type", "application/json")
        ctx.body = JSON.stringify(categoryType)
    }
})

export default router