// External imports
import {Context} from "koa";
let Router = require('koa-router');

// Internal imports
import {
    createActivityType,
    getActivityTypes,
    updateActivityType
} from "../../dao/activityTypeDao";
import protect from "../../middleware/auth";
import contentType from "../../middleware/contentType";

let router = new Router()

export type ActivityType = {
    activityid:string,
    categoryid:string,
    userid:string,
    long:string,
    short:string,
    archived:boolean
}


/**
 * Route for updating an activity type.
 */
router.patch("/activity-type/:activityid", protect.user, contentType.JSON, async (ctx: Context) => {
    const userid = ctx.params.userid
    const activityid = ctx.params.activityid
    let activityToUpdate = ctx.request.body as ActivityType

    const {status, error, activityType} = await updateActivityType(userid, activityToUpdate, activityid)

    if (error.length > 0) {
        ctx.throw(status, error, {path: __filename})
    }

    ctx.status = status
    ctx.body = activityType
})

/**
 * Route for fetching all unarchived activity types for a user.
 */
router.get("/activity-types", protect.user,async (ctx: Context) => {
    const userid = ctx.params.userid

    let {status, activityTypes, error} = await getActivityTypes(userid)

    if (status === 400) {
        ctx.throw(status, error, {path: __filename})
    }

    ctx.status = status
    ctx.body = activityTypes
})

/**
 * Route for creating an activity type for a user.
 */
router.post("/activity-types", protect.user, contentType.JSON, async (ctx: Context) => {
    const userid = ctx.params.userid
    const activityTypeToCreate = ctx.request.body as ActivityType

    const {status, activityType, error} = await createActivityType(userid, activityTypeToCreate.categoryid, activityTypeToCreate.long, activityTypeToCreate.short)

    if (status === 422) {
        ctx.throw(status, error, {path: __filename})
    }

    ctx.status = status

    ctx.body = [{
        activityid: activityType[0].activityid,
        categoryid: activityType[0].categoryid,
        long: activityType[0].long,
        short: activityType[0].short,
    }]
})


export default router