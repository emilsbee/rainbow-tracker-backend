// External imports
import {Context, Next} from "koa";
let Router = require('koa-router');

// Internal imports
import contentType from "../../middleware/contentType";
import protect from "../../middleware/auth";
import {createActivityType, getActivityTypes} from "../../dao/activityTypeDao";

let router = new Router()

export type ActivityType = {
    activityid:string,
    categoryid:string,
    userid:string,
    long:string,
    short:string,
    archived:boolean
}


router.get("/activity-types", async (ctx: Context) => {
    const userid = ctx.params.userid

    let {status, activityTypes, error} = await getActivityTypes(userid)

    if (status === 400) {
        ctx.throw(status, error, {path: __filename})
    }

    ctx.status = status

    ctx.body = activityTypes.map(activityType => {
        return {
            activityid: activityType.activityid,
            categoryid: activityType.categoryid,
            long: activityType.long,
            short: activityType.short,
        }
    })
})

router.post("/activity-types", async (ctx: Context) => {
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