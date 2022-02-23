import { Context } from 'koa';
const Router = require('koa-router');
import { Category } from '@prisma/client';

import { contentType } from 'middleware';
import { updateCategories } from 'dao';

export const categoryRouter = new Router();

 categoryRouter.patch('/categories', contentType.JSON, async (ctx: Context) => {
    const userid = ctx.state.user.userid;
    const categoriesToUpdate = ctx.request.body as Category[];

    const { status, error, data: categories } = await updateCategories({ userid, categories: categoriesToUpdate });

    if (error.length > 0 || !categories) {
        ctx.throw(status, error);
    }

    ctx.status = status;
    ctx.body = categories;
});
