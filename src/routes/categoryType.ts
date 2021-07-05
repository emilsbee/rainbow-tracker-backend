// External imports
import {Context, Next} from "koa";
let Router = require('koa-router');

// Internal imports
import contentType from "../middleware/contentType";
import protect from "../middleware/auth";
import {createCategoryType, getCategoryTypes} from "../dao/categoryTypeDao";

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

router.put("/category-type/:categoryid", protect.user, async (ctx:Context, next:Next) => {
    const userid = ctx.params.userid
    let categoryid:string = ctx.params.categoryid

    ctx.status = 200
})

/**
 * Route for fetching the category types for a user.
 * @return categoryType[] array of the category types.
 */
router.get("/category-types", protect.user, async (ctx:Context, next:Next) => {
    const userid = ctx.params.userid
    let {status, categoryTypes} = await getCategoryTypes(userid)
    ctx.status = status
    ctx.set("Content-Type", "application/json")
    ctx.body = JSON.stringify(categoryTypes)
})

/**
 * Route for creating a category type for a user.
 * @return categoryType the created category type object.
 */
router.post("/category-types", contentType.JSON, protect.user, async (ctx:Context, next:Next) => {
    const userid = ctx.params.userid
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