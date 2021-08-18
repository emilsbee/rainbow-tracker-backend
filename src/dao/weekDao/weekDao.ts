// External imports
import {PoolClient} from "pg";
import {v4 as uuid} from "uuid";

// Internal imports
import {Category, FullWeek, Note} from "../../routes/public/week/week";
import {groupByDays} from "./helpers";
import db from "../../db/postgres"
import {DateTime} from "luxon";

/**
 * Fetches a week by a given weekid for a given user. The week returned is a full week,
 * meaning it includes the categories and notes.
 * @param weekid of category to fetch.
 * @param userid of category to fetch.
 * @return {{ status: number, category: FullWeek[] }}
 */
export const getWeekByWeekid = async (weekid:string, userid:string):Promise<{ status: number, week: FullWeek[], error:string }> => {
    const client:PoolClient = await db.getClient()
    const values = [weekid, userid]
    const getWeekNotes = {name: 'fetch-notes', text: 'SELECT * FROM note WHERE note.weekid = $1 AND note.userid = $2 ORDER BY note."notePosition" ASC', values}
    const getWeekQuery = {name: 'fetch-week', text: 'SELECT * FROM week WHERE week.weekid = $1 AND week.userid = $2', values}
    const getWeekCategories = {name: 'fetch-categories', text:'SELECT *, to_char("weekDayDate", \'YYYY-MM-DD\') as "weekDayDate" FROM category WHERE category.weekid = $1 AND category.userid = $2 ORDER BY category."categoryPosition" ASC', values}

    try {
        // Begin transaction
        await client.query('BEGIN')

        // Execute queries
        let week = await client.query(getWeekQuery)
        let notes = await client.query(getWeekNotes)
        let categories = await client.query(getWeekCategories)

        return {
            status: 200,
            week: [{
                weekid: week.rows[0].weekid,
                userid: week.rows[0].userid,
                weekNr: week.rows[0].weekNr,
                weekYear: week.rows[0].weekYear,
                categories: groupByDays(categories.rows),
                notes: groupByDays(notes.rows)
            }],
            error: ""
        }
    } catch (e) {

        await client.query('ROLLBACK')
        return {
            status: 400,
            week: [],
            error: e.message
        }
    } finally {
        client.release()
    }
}

/**
 * Fetches weekid by given weekNr and weekYear for a given user.
 * @param weekNr of the week.
 * @param weekYear of the week.
 * @param userid or null if no week found.
 */
export const getWeekId = async (weekNr:number, weekYear:number, userid:string):Promise<{weekid: string | null, error:string}> => {
    let weekidQueryValues = [userid, weekNr, weekYear]
    const getWeekidQuery = {name: "fetch-weekid", text: 'SELECT weekid FROM week WHERE week.userid=$1 AND week."weekNr"=$2 AND week."weekYear"=$3', values: weekidQueryValues}

    try {
        let weekid = await db.query(getWeekidQuery)

        if (weekid.rowCount === 0) {
            return {weekid: null, error: `Week ${weekNr}, ${weekYear} was not found for user ${userid}.`}
        } else {
            return {weekid: weekid.rows[0].weekid, error: ""}
        }
    } catch (e) {
        return {weekid: null, error: e.message}
    }
}

/**
 * Creates a full week (with categories and notes) with given week_number and week_year for a given user.
 * @param weekNr of the week to create.
 * @param weekYear of the week to create.
 * @param userid of the user for which to create the week.
 * @return {{status:number, category:FullWeek[]}}
 */
export const createWeek = async (weekNr:number, weekYear:number, userid:string):Promise<{ status: number, week: FullWeek[], error:string }> => {
    const client:PoolClient = await db.getClient()

    try {
        // Begin transaction
        await client.query('BEGIN')

        // Save week
        const createWeekQuery = 'INSERT INTO week(weekid, userid, "weekNr", "weekYear") VALUES($1, $2, $3, $4);'
        let weekid = uuid()
        const values = [weekid, userid, weekNr, weekYear]
        await client.query(createWeekQuery, values)

        // Save weeks's categories and notes
        const categories:Category[] = []
        const notes:Note[] = []
        const createCategoryQuery:string = 'INSERT INTO category(weekid, "weekDay", "categoryPosition", userid, "weekDayDate") VALUES($1, $2, $3, $4, $5);'
        const createNoteQuery:string = 'INSERT INTO note(weekid, "weekDay", "notePosition", stackid, userid, note, "weekDayDate") VALUES($1, $2, $3, $4, $5, $6, $7);'

        for (let dayIndex:number = 0; dayIndex < 7; dayIndex++) {
            for (let pos:number = 1; pos < 97; pos++) {
                // Save category
                let weekDayDate: string = DateTime.fromISO(`${weekYear}-W${String(weekNr).padStart(2, '0')}-${dayIndex+1}`).toISODate()

                let categoryValues = [weekid, dayIndex, pos,  userid, weekDayDate]
                categories.push({
                    weekid, weekDay:dayIndex, categoryPosition:pos, userid, categoryid:null, activityid:null, weekDayDate
                })
                await client.query(createCategoryQuery, categoryValues)

                // Save note
                let stackid = uuid()
                let noteValues = [weekid, dayIndex, pos, stackid, userid, "", weekDayDate]
                notes.push({
                    weekid, weekDay:dayIndex, notePosition:pos, stackid, userid, note: "", weekDayDate
                })
                await client.query(createNoteQuery, noteValues)
            }
        }

        // Commit transaction
        await client.query('COMMIT')

        return {
            status: 201,
            week: [{weekid, userid: userid, weekNr:weekNr, weekYear:weekYear, notes:groupByDays(notes), categories:groupByDays(categories)}],
            error: ""
        }
    } catch (e) {
        await client.query('ROLLBACK')
        return {status: 400, week: [], error: e.message}
    } finally {
        client.release()
    }
}