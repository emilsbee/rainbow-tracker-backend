import { Context } from 'koa';
const Router = require('koa-router');
import { Note } from '@prisma/client';

import { contentType } from 'middleware';
import { updateNotes } from 'dao';

export const noteRouter = new Router();

/**
 * Route for updating a given week day's notes. So all notes from a specific week
 * and a specific day are updated. To be more specific, the aspect of notes that is
 * updated is the note text itself . However, all the information of a note has to
 * be provided like the notePosition, weekid, etc.
 */
 noteRouter.patch('/week/:weekid/day/:day/notes', contentType.JSON, async (ctx:Context) => {
    const weekid = ctx.params.weekid;
    const userid = ctx.state.user.userid;
    const day = ctx.params.day;
    const notes = ctx.request.body as Note[];

    const { status, error } = await updateNotes({ userid, notes });

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
});
