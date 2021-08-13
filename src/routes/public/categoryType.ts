// External imports
import {Context, Next} from "koa";
let Router = require('koa-router');

// Internal imports
import contentType from "../../middleware/contentType";
import protect from "../../middleware/auth";
import {
    createCategoryType,
    deleteCategoryType,
    getCategoryTypes,
    getCategoryTypesFull,
    updateCategoryType
} from "../../dao/categoryTypeDao";

let router = new Router()

export type CategoryType = {
    categoryid:string,
    userid:string,
    color:string,
    name:string,
    archived:boolean
}

/**
 * Route for getting all user's category types and all activity types.
 */
router.get("/category-types-full", protect.user, async (ctx: Context) => {
    const userid = ctx.params.userid

    let {status, categoryTypes, activityTypes, error} = await getCategoryTypesFull(userid)

    if (error && error.length > 0) {
        ctx.throw(status, error, {path: __filename})
    }

    ctx.status = status
    ctx.body = [{categoryTypes, activityTypes}]
})

/**
 * Route for archiving a category type, including all the activity types
 * of that category type.
 */
router.delete("/category-type/:categoryid", protect.user, async (ctx:Context) => {
    const userid = ctx.params.userid
    const categoryid = ctx.params.categoryid

    let {status, error} = await deleteCategoryType(userid, categoryid)

    if (status === 400 || status === 404) {
        ctx.throw(status, error, {path: __filename})
    }

    ctx.status = status
})

/**
 * Route for updating a category type.
 * @return categoryType[]
 */
router.patch("/category-type/:categoryid", protect.user, async (ctx:Context, next:Next) => {
    const userid = ctx.params.userid
    const categoryid = ctx.params.categoryid
    let categoryToUpdate = ctx.request.body as CategoryType

    let {status, categoryType, error} = await updateCategoryType(userid, categoryToUpdate, categoryid)

    if (status === 404 || status === 400) {
        ctx.throw(status, error, {path: __filename})
    }

    ctx.status = status

    ctx.body = categoryType
})

/**
 * Route for fetching the category types for a user.
 * @return categoryType[] array of the category types.
 */
router.get("/category-types", protect.user, async (ctx:Context, next:Next) => {
    const userid = ctx.params.userid
    let {status, categoryTypes, error} = await getCategoryTypes(userid)

    if (status === 400) {
        ctx.throw(status, error, {path: __filename})
    }

    ctx.status = status

    ctx.body = categoryTypes
})

/**
 * Route for creating a category type for a user.
 * @return categoryType the created category type object.
 */
router.post("/category-types", contentType.JSON, protect.user, async (ctx:Context, next:Next) => {
    const userid = ctx.params.userid
    const categoryTypeToCreate = ctx.request.body as CategoryType

    const {status, categoryType, error} = await createCategoryType(userid, categoryTypeToCreate.color, categoryTypeToCreate.name)

    if (status === 422) {
        ctx.throw(status, error, {path: __filename})
    }

    ctx.status = status

    ctx.body = [{
        categoryid: categoryType[0].categoryid,
        name: categoryType[0].name,
        color: categoryType[0].color
    }]
})

export default router