// External imports
import {Client} from "pg";
import {v4 as uuid} from "uuid";

// Internal imports
import {Category, FullWeek, Note, Week} from "./week";
const db = require("../../db")


/**
 * Given an array of categories or notes, this function creates a double
 * array ordered by days (starting at monday and ending sunday). This is for
 * easier rendering on frontend.
 * @param items Note[] or Category[]
 * @return (Note | Category)[][]
 */
export const groupByDays = (items: Note[] | Category[]):any[][] => {
    let dayArrays:(Note | Category)[][] = [[], [], [], [], [], [], []]

    items.forEach(item => {
        dayArrays[item.week_day].push(item)
    })
    return dayArrays
}

/**
 * Fetches a week by a given week_id for a given user.
 * @param week_id of week to fetch.
 * @param user_id of week to fetch.
 * @return {{ status: number, week: FullWeek[] }}
 */
export const getWeekByWeekid = async (week_id:string, user_id:string):Promise<{ status: number, week: FullWeek[] }> => {
    const client:Client = await db.getClient()
    const values = [week_id, user_id]
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

        // Check that week and its categories, notes were found
        if (week.rowCount === 1 && notes.rowCount === 672 && categories.rowCount === 672) {
            // Commit transaction
            await client.query('COMMIT')

            return {
                status: 200,
                week: [{
                    ...week.rows[0],
                    categories: groupByDays(categories.rows),
                    notes: groupByDays(notes.rows)
                }]
            }
        } else { // If the week doesnt have any categories or notes associated with it
            await client.query('ROLLBACK')
            return {
                status: 400,
                week: []
            }
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
 * Fetches week_id by given week_number and week_year for a given user.
 * Here the week_number and week_year are string because they are extracted as strings from the request.
 * @param week_number of the week.
 * @param week_year of the week.
 * @param user_id or null if no week found.
 */
export const getWeekId = async (week_number:string, week_year:string, user_id:string):Promise<string> => {
    let weekidQueryValues = [user_id, week_number, week_year]
    const getWeekidQuery = {name: "fetch-weekid", text: "SELECT week_id FROM weeks WHERE weeks.user_id=$1 AND weeks.week_number=$2 AND weeks.week_year=$3", values: weekidQueryValues}

    try {
        let week_id = await db.query(getWeekidQuery)

        if (week_id.rowCount === 0) {
            return null
        } else {
            return week_id.rows[0].week_id
        }
    } catch (e) {
        return null
    }
}

/**
 * Creates a week with given week_number and week_year for a given user.
 * @param week_number of the week to create.
 * @param week_year of the week to create.
 * @param user_id of the user for which to create the week.
 * @return {{status:number, week:FullWeek[]}}
 */
export const createWeek = async (week_number:string, week_year:string, user_id:string):Promise<{ status: number, week: FullWeek[] }> => {
    const client:Client = await db.getClient()

    try {
        // Begin transaction
        await client.query('BEGIN')

        // Save week
        const createWeekQuery = "INSERT INTO weeks(week_id, user_id, week_number, week_year) VALUES($1, $2, $3, $4);"
        let week_id = uuid()
        const values = [week_id, user_id, week_number, week_year]
        await client.query(createWeekQuery, values)

        // Save week's categories and notes
        const categories:Category[] = []
        const notes:Note[] = []
        const createCategoryQuery:string = "INSERT INTO categories(week_id, week_day, category_position, user_id) VALUES($1, $2, $3, $4);"
        const createNoteQuery:string = "INSERT INTO notes(week_id, week_day, note_position, stack_id, user_id, note) VALUES($1, $2, $3, $4, $5, $6);"
        for (let dayIndex:number = 0; dayIndex < 7; dayIndex++) {
            for (let pos:number = 1; pos < 97; pos++) {
                // Save category
                let categoryValues = [week_id, dayIndex, pos,  user_id]
                categories.push({
                    week_id, week_day:dayIndex, category_position:pos, user_id, category_id:null, activity_id:null
                })
                await client.query(createCategoryQuery, categoryValues)

                // Save note
                let stack_id = uuid()
                let noteValues = [week_id, dayIndex, pos, stack_id, user_id, ""]
                notes.push({
                    week_id, week_day:dayIndex, note_position:pos, stack_id, user_id, note: ""
                })
                await client.query(createNoteQuery, noteValues)
            }
        }

        // Commit transaction
        await client.query('COMMIT')

        return {status: 201, week: [{week_id, user_id: user_id, week_number: parseInt(week_number), week_year: parseInt(week_year), notes:groupByDays(notes), categories:groupByDays(categories)}]}
    } catch (e) {
        await client.query('ROLLBACK')
        return {status: 400, week: []}
    } finally {
        await client.end()
    }
}