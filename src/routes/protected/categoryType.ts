import * as i from "types";
import { Context, Next } from "koa";
import Router from "koa-router";

import contentType from "../../middleware/contentType";
import protect from "../../middleware/auth";
import {
    createCategoryType, archiveCategoryType, getCategoryTypes,
    getCategoryTypesFull, restoreCategoryType, updateCategoryType,
} from "../../dao/categoryTypeDao/categoryTypeDao";

const router = new Router();

router.patch("/category-type/restore/:categoryid", async (ctx:Context) => {
    const userid = ctx.state.user.userid;
    const categoryid: string = ctx.params.categoryid;

    const { status, error } = await restoreCategoryType(userid, categoryid);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
});

router.get("/category-types-full", async (ctx: Context) => {
    const userid = ctx.state.user.userid;

    const { status, data: { categoryTypes, activityTypes }, error } = await getCategoryTypesFull(userid);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
    ctx.body = { categoryTypes, activityTypes };
});

router.delete("/category-type/:categoryid", async (ctx:Context) => {
    const userid = ctx.state.user.userid;
    const categoryid: string = ctx.params.categoryid;

    const { status, error } = await archiveCategoryType(userid, categoryid);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
});

router.patch("/category-type/:categoryid", contentType.JSON, async (ctx:Context, next:Next) => {
    const userid = ctx.state.user.userid;
    const categoryid: string = ctx.params.categoryid;
    const categoryToUpdate = ctx.request.body as i.CategoryType;

    const { status, data: categoryType, error } = await updateCategoryType(userid, categoryToUpdate, categoryid);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;

    ctx.body = categoryType;
});

router.get("/category-types", async (ctx:Context, next:Next) => {
    const userid = ctx.state.user.userid;

    const { status, data: categoryTypes, error } = await getCategoryTypes(userid);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;

    ctx.body = categoryTypes;
});

router.post("/category-types", contentType.JSON, async (ctx:Context) => {
    const userid = ctx.state.user.userid;
    const categoryTypeToCreate = ctx.request.body as i.CategoryType;

    const { status, data: categoryType, error } = await createCategoryType(userid, categoryTypeToCreate.color, categoryTypeToCreate.name);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;

    ctx.body = {
        categoryid: categoryType[0].categoryid,
        name: categoryType[0].name,
        color: categoryType[0].color,
    };
});

export default router;
