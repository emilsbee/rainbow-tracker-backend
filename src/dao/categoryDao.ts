// Internal imports
import {PoolClient} from "pg";
import {Category} from "../routes/public/week";
import db from "../db/postgres"
import {DAY_TIME_SLOTS} from "../constants/constants";


/**
 * Updates a given week day's categories for a user.
 * @param weekid of the week to update.
 * @param userid of the user for which to update the week.
 * @param categories the new categories to update the week with.
 * @param day for which to update given categories.
 * @return status code.
 */
export const updateWeekDayCategories = async (weekid: string, userid: string, categories: Category[], day: number): Promise<{ status: number, error: string }> => {
    const client: PoolClient = await db.getClient()
    const updateWeekDayCategoriesQuery = 'UPDATE category SET categoryid=$1, activityid=$2 WHERE weekid=$3 AND "weekDay"=$4 AND "categoryPosition"=$5 AND userid=$6'

    try {
        // Begin transaction
        await client.query('BEGIN')

        for (let i = 0; i < DAY_TIME_SLOTS; i++) {
            let updateWeekDayCategoriesQueryValues = [categories[i].categoryid, categories[i].activityid, weekid, day, categories[i].categoryPosition, userid]
            let res = await client.query(updateWeekDayCategoriesQuery, updateWeekDayCategoriesQueryValues)

            if (res.rowCount < 1) {
                return {status: 404, error: ""}
            }
        }

        return {status: 204, error: ""}
    } catch (e) {
        await client.query('ROLLBACK')
        return {status: 400, error: e}
    } finally {
        client.release()
    }
}