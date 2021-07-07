// External imports
import {Client} from "pg";
import {v4 as uuid} from "uuid";

// Internal imports
import {Category, FullWeek, Note} from "../../routes/week";
import {groupByDays} from "./helpers";
const db = require("../../db")

/**
 * Updates a given week's categories for a user.
 * @param weekid of the week to update.
 * @param userid of the user for which to update the week.
 * @param categories the new categories to update the week with.
 * @return status code.
 */
export const updateWeekCategoriesByWeekid = async (weekid:string, userid:string, categories:Category[]):Promise<number> => {
    const client:Client = await db.getClient()
    const updateWeekCategoriesQuery = 'UPDATE category SET categoryid=$1, activityid=$2 WHERE weekid=$3 AND "weekDay"=$4 AND "categoryPosition"=$5 AND userid=$6'

    try {
        // Begin transaction
        await client.query('BEGIN')

        for (let i = 0; i < categories.length; i++) {
            let updateWeekCategoriesQueryValues = [categories[i].categoryid, categories[i].activityid, weekid, categories[i].weekDay, categories[i].categoryPosition, userid]
            await client.query(updateWeekCategoriesQuery, updateWeekCategoriesQueryValues)
        }

        return 204
    } catch (e) {
        await client.query('ROLLBACK')
        return 400
    } finally {
        await client.end()
    }
}

/**
 * Fetches a week by a given weekid for a given user. The week returned is a full week,
 * meaning it includes the categories and notes.
 * @param weekid of category to fetch.
 * @param userid of category to fetch.
 * @return {{ status: number, category: FullWeek[] }}
 */
export const getWeekByWeekid = async (weekid:string, userid:string):Promise<{ status: number, week: FullWeek[] }> => {
    const client:Client = await db.getClient()
    const values = [weekid, userid]
    const getWeekNotes = {name: 'fetch-notes', text: 'SELECT * FROM note WHERE note.weekid = $1 AND note.userid = $2', values}
    const getWeekQuery = {name: 'fetch-week', text: 'SELECT * FROM week WHERE week.weekid = $1 AND week.userid = $2', values}
    const getWeekCategories = {name: 'fetch-categories', text:'SELECT * FROM category WHERE category.weekid = $1 AND category.userid = $2', values}

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
            }]
        }
    } catch (e) {

        await client.query('ROLLBACK')
        return {
            status: 400,
            week: []
        }
    } finally {
        await client.end()
    }
}

/**
 * Fetches weekid by given weekNr and weekYear for a given user.
 * @param weekNr of the week.
 * @param weekYear of the week.
 * @param userid or null if no week found.
 */
export const getWeekId = async (weekNr:number, weekYear:number, userid:string):Promise<string | null> => {
    let weekidQueryValues = [userid, weekNr, weekYear]
    const getWeekidQuery = {name: "fetch-weekid", text: 'SELECT weekid FROM week WHERE week.userid=$1 AND week."weekNr"=$2 AND week."weekYear"=$3', values: weekidQueryValues}

    try {
        let weekid = await db.query(getWeekidQuery)

        if (weekid.rowCount === 0) {
            return null
        } else {
            return weekid.rows[0].weekid
        }
    } catch (e) {
        return null
    }
}

/**
 * Creates a full week (with categories and notes) with given week_number and week_year for a given user.
 * @param weekNr of the week to create.
 * @param weekYear of the week to create.
 * @param userid of the user for which to create the week.
 * @return {{status:number, category:FullWeek[]}}
 */
export const createWeek = async (weekNr:number, weekYear:number, userid:string):Promise<{ status: number, week: FullWeek[] }> => {
    const client:Client = await db.getClient()

    try {
        // Begin transaction
        await client.query('BEGIN')

        // Save category
        const createWeekQuery = 'INSERT INTO week(weekid, userid, "weekNr", "weekYear") VALUES($1, $2, $3, $4);'
        let weekid = uuid()
        const values = [weekid, userid, weekNr, weekYear]
        await client.query(createWeekQuery, values)

        // Save category's categories and notes
        const categories:Category[] = []
        const notes:Note[] = []
        const createCategoryQuery:string = 'INSERT INTO category(weekid, "weekDay", "categoryPosition", userid) VALUES($1, $2, $3, $4);'
        const createNoteQuery:string = 'INSERT INTO note(weekid, "weekDay", "notePosition", stackid, userid, note) VALUES($1, $2, $3, $4, $5, $6);'

        for (let dayIndex:number = 0; dayIndex < 7; dayIndex++) {
            for (let pos:number = 1; pos < 97; pos++) {
                // Save category
                let categoryValues = [weekid, dayIndex, pos,  userid]
                categories.push({
                    weekid, weekDay:dayIndex, categoryPosition:pos, userid, categoryid:null, activityid:null
                })
                await client.query(createCategoryQuery, categoryValues)

                // Save note
                let stackid = uuid()
                let noteValues = [weekid, dayIndex, pos, stackid, userid, ""]
                notes.push({
                    weekid, weekDay:dayIndex, notePosition:pos, stackid, userid, note: ""
                })
                await client.query(createNoteQuery, noteValues)
            }
        }

        // Commit transaction
        await client.query('COMMIT')

        return {status: 201, week: [{weekid, userid: userid, weekNr:weekNr, weekYear:weekYear, notes:groupByDays(notes), categories:groupByDays(categories)}]}
    } catch (e) {
        await client.query('ROLLBACK')
        return {status: 400, week: []}
    } finally {
        await client.end()
    }
}