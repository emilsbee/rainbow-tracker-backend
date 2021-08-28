// External imports
import {PoolClient, QueryResult} from "pg";

// Internal imports
import {Note} from "../routes/public/week/week";
import db from "../db/postgres"
import {DAY_TIME_SLOTS} from "../constants/constants";

/**
 * Updates a given week day's categories for a user.
 * @param weekid of the week for which to update notes.
 * @param userid of the user for which to update notes.
 * @param notes the new notes to update the week with.
 * @param day for which to update with the given notes.
 */
export const updateWeekDayNotes = async (weekid: string, userid: string, notes: Note[], day: number): Promise<{ status: number, error: string }> => {
    const client: PoolClient = await db.getClient()
    const updateWeekDayNotesQuery = 'UPDATE note SET note=$1, stackid=$2 WHERE weekid=$3 AND "weekDay"=$4 AND "notePosition"=$5 AND userid=$6'

    try {
        // Begin transaction
        await client.query("BEGIN")

        for (let i = 0; i < DAY_TIME_SLOTS; i++) {
            let updateWeekDayNotesQueryValues = [notes[i].note, notes[i].stackid, weekid, day, notes[i].notePosition, userid]
            let res: QueryResult = await client.query(updateWeekDayNotesQuery, updateWeekDayNotesQueryValues)

            if (res.rowCount < 1) {
                return {status: 404, error: "Note not found."}
            }
        }

        return {status: 204, error: ""}
    } catch (e: any) {
        await client.query("ROLLBACK")
        return {status: 400, error: e}
    } finally {
        client.release()
    }
}
