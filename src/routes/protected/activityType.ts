import * as i from "types";
import { Context } from "koa";
import Router from "koa-router";

import {
    createActivityType,
    getActivityTypes,
    updateActivityType,
} from "../../dao/activityTypeDao";
import protect from "../../middleware/auth";
import contentType from "../../middleware/contentType";

const router = new Router();

router.patch("/activity-type/:activityid", contentType.JSON, async (ctx: Context) => {
    const userid = ctx.state.user.userid;
    const activityid: string = ctx.params.activityid;
    const activityToUpdate = ctx.request.body as i.ActivityType;

    const { status, error, data: activityType } = await updateActivityType(userid, activityToUpdate, activityid);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
    ctx.body = activityType;
});

router.get("/activity-types", async (ctx: Context) => {
    const userid = ctx.state.user.userid;

    const { status, data: activityTypes, error } = await getActivityTypes(userid);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
    ctx.body = activityTypes;
});

router.post("/activity-types", contentType.JSON, async (ctx: Context) => {
    const userid = ctx.state.user.userid;
    const activityTypeToCreate = ctx.request.body as i.ActivityType;

    const { status, data: activityType, error } = await createActivityType(userid, activityTypeToCreate);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
    ctx.body = activityType;
});


export default router;
