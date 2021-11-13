import * as i from "types";
import { Context } from "koa";
const Router = require("koa-router");

import contentType from "../../../middleware/contentType";
import protect from "../../../middleware/auth";
import { updateWeekDayNotes } from "../../../dao/noteDao";

const router = new Router();

/**
 * Route for updating a given week day's notes. So all notes from a specific week
 * and a specific day are updated. To be more specific, the aspect of notes that is
 * updated is the note text itself . However, all the information of a note has to
 * be provided like the notePosition, weekid, etc.
 */
router.patch("/week/:weekid/day/:day/notes", contentType.JSON, protect.user, async (ctx:Context) => {
    const weekid = ctx.params.weekid;
    const userid = ctx.params.userid;
    const day = ctx.params.day;
    const notes = ctx.request.body as i.Note[];

    const { status, error } = await updateWeekDayNotes(weekid, userid, notes, day);

    if (error.length > 0) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
});


export default router;
