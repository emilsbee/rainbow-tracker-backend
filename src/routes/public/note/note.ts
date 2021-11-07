// External imports
import { Context } from "koa";
const Router = require("koa-router");

// Internal imports
import contentType from "../../../middleware/contentType";
import protect from "../../../middleware/auth";
import { Note } from "../week/week";
import { updateWeekDayNotes } from "../../../dao/noteDao";

const router = new Router(); // Initialize router

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
    const notes = ctx.request.body as unknown as Note[];

    const { status, error } = await updateWeekDayNotes(weekid, userid, notes, day);

    if (status === 400 || status === 404) {
        ctx.throw(status, error, { path: __filename });
    }

    ctx.status = status;
});


export default router;
