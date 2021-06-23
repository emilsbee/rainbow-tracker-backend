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
 */
export const updateWeekCategoriesByWeekid = async (weekid:string, userid:string, categories:Category[]) => {
    const client:Client = await db.getClient()
    const updateWeekCategoriesQuery = "UPDATE categories SET category_id=$1, activity_id=$2 WHERE week_id=$3 AND week_day=$4 AND category_position=$5 AND user_id=$6"

    try {
        // Begin transaction
        await client.query('BEGIN')

        for (let i = 0; i < categories.length; i++) {
            
        }

    } catch (e) {
        await client.query('ROLLBACK')

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
    const getWeekNotes = {name: 'fetch-notes', text: 'SELECT * FROM notes WHERE notes.week_id = $1 AND notes.user_id = $2', values}
    const getWeekQuery = {name: 'fetch-week', text: 'SELECT * FROM weeks WHERE weeks.week_id = $1 AND weeks.user_id = $2', values}
    const getWeekCategories = {name: 'fetch-categories', text:'SELECT * FROM categories WHERE categories.week_id = $1 AND categories.user_id = $2', values}

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
                weekid: week.rows[0].week_id,
                userid: week.rows[0].user_id,
                weekNr: week.rows[0].week_number,
                weekYear: week.rows[0].week_year,
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
export const getWeekId = async (weekNr:number, weekYear:number, userid:string):Promise<string> => {
    let weekidQueryValues = [userid, weekNr, weekYear]
    const getWeekidQuery = {name: "fetch-weekid", text: "SELECT week_id FROM weeks WHERE weeks.user_id=$1 AND weeks.week_number=$2 AND weeks.week_year=$3", values: weekidQueryValues}

    try {
        let weekid = await db.query(getWeekidQuery)

        if (weekid.rowCount === 0) {
            return null
        } else {
            return weekid.rows[0].week_id
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
        const createWeekQuery = "INSERT INTO weeks(week_id, user_id, week_number, week_year) VALUES($1, $2, $3, $4);"
        let weekid = uuid()
        const values = [weekid, userid, weekNr, weekYear]
        await client.query(createWeekQuery, values)

        // Save category's categories and notes
        const categories:Category[] = []
        const notes:Note[] = []
        const createCategoryQuery:string = "INSERT INTO categories(week_id, week_day, category_position, user_id) VALUES($1, $2, $3, $4);"
        const createNoteQuery:string = "INSERT INTO notes(week_id, week_day, note_position, stack_id, user_id, note) VALUES($1, $2, $3, $4, $5, $6);"

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