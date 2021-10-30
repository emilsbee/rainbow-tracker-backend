// External imports
import {PoolClient, QueryResult} from "pg";

// Internal imports
import {Category} from "../routes/public/week/week";
import db from "../db/postgres"

/**
 * Updates a given week day's categories for a user.
 * @param weekid of the week for which to update categories.
 * @param userid of the user for which to update categories.
 * @param categories the new categories to update the week with.
 * @param day for which to update given categories.
 */
export const updateWeekDayCategories = async (weekid: string, userid: string, categories: Category[], day: number): Promise<{ status: number, error: string, categories: Category[] }> => {
    const client: PoolClient = await db.getClient()
    const updateWeekDayCategoriesQuery = 'UPDATE category SET categoryid=$1, activityid=$2 WHERE weekid=$3 AND "weekDay"=$4 AND "categoryPosition"=$5 AND userid=$6'

    try {
        // Begin transaction
        await client.query('BEGIN')

        for (let i = 0; i < categories.length; i++) {
            let updateWeekDayCategoriesQueryValues = [categories[i].categoryid, categories[i].activityid, weekid, day, categories[i].categoryPosition, userid]
            let res: QueryResult = await client.query(updateWeekDayCategoriesQuery, updateWeekDayCategoriesQueryValues)
            categories[i].userid = userid

            if (res.rowCount < 1) {
                await client.query("COMMIT")
                return {status: 404, error: `Category not found for week ${weekid}.`, categories: []}
            }
        }

        await client.query("COMMIT")
        return {status: 200, error: "", categories}
    } catch (e: any) {
        await client.query('ROLLBACK')
        return {status: 400, error: e.message, categories: []}
    } finally {
        client.release()
    }
}