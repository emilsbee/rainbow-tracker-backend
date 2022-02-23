import { Context } from 'koa';
import Router from 'koa-router';
import { Week } from '@prisma/client';

import { contentType } from 'middleware';
import { createFullWeek, getFullWeekById, getWeekId } from 'dao';
import { canCreateNewWeek } from 'services';

export const weekRouter = new Router(); // Initialize router

/**
 * Route for creating a week with a given query parameters week_number and week_year.
 * Also, generates the week's categories and notes.
 * @return week with notes and categories organized in days.
 */
 weekRouter.post('/weeks', contentType.JSON, async (ctx: Context) => {
    const userid = ctx.state.user.userid;
    const { weekNr, weekYear } = ctx.request.body as Week;
    const { status, data: week, error } = await createFullWeek({ weekNr, weekYear, userid });

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
    ctx.body = week;
});

weekRouter.get('/week', async (ctx: Context) => {
    const userid = ctx.state.user.userid;
    const weekNr = ctx.request.query.week_number as string;
    const weekYear = ctx.request.query.week_year as string;

    const getWeekIdData = await getWeekId({ weekNr: parseInt(weekNr), weekYear: parseInt(weekYear), userid });

    // Check for !success because even if weekid was not found, we want to create a new week.
    // So only throw when the operation failed which is indicated by success property.
    if (!getWeekIdData.success) {
        ctx.throw(getWeekIdData.status, getWeekIdData.error);
    } else if (!getWeekIdData.data) {
        if (canCreateNewWeek(parseInt(weekNr), parseInt(weekYear))) {
            const createWeekData = await createFullWeek({ weekNr: parseInt(weekNr), weekYear: parseInt(weekYear), userid });

            if (createWeekData.error.length > 0 || !createWeekData.data) {
                ctx.throw(createWeekData.status, createWeekData.error);
            }

            ctx.status = 200;
            ctx.body = createWeekData.data;
        } else {
            ctx.throw(400, 'A week can be created maximums 2 years in the future.');
        }
    } else {
        const getWeekByWeekIdData = await getFullWeekById({ weekid: getWeekIdData.data, userid });

        if (getWeekByWeekIdData.error.length > 0 || !getWeekByWeekIdData.data) {
            ctx.throw(getWeekByWeekIdData.status, getWeekByWeekIdData.error);
        }

        ctx.status = 200;
        ctx.body = getWeekByWeekIdData.data;
    }
});
