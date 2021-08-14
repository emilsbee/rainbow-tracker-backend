// External imports
import {PoolClient, QueryResult} from "pg";

// Internal imports
import db from "../db/postgres"

/**
 * This type is specific to the return statement of function below.
 */
type TotalPerWeek = {
    categoryTypes: {categoryid: string, amount: number}[],
    activityTypes: {activityid: string, amount: number}[]
}
/**
 * Fetches the amount of time spent on each category type and activity type
 * for a given week. In the return type, amount symbolizes the amount of 15
 * minute intervals.
 * @param userid of the user for which to find the total per week.
 * @param weekid of the week for which to find the total per week.
 */
export const getTotalPerWeek = async (userid: string, weekid: string): Promise<{ status: number, error: string, totalPerWeek: TotalPerWeek[]}> => {
    const client: PoolClient = await db.getClient()
    const getTotalPerWeekCategoryTypesQuery = 'SELECT category.categoryid, COUNT(category.categoryid), category_type.name, category_type.color ' +
        'FROM category, category_type ' +
        'WHERE category.weekid=$1 AND ' +
        'category.userid=$2 AND ' +
        'category.categoryid IS NOT NULL AND ' +
        'category_type.userid=category.userid AND ' +
        'category.categoryid=category_type.categoryid ' +
        'GROUP BY category.categoryid, category_type.name, category_type.color;'

    const getTotalPerWeekActivityTypesQuery = 'SELECT category.categoryid, category.activityid, COUNT(category.activityid), activity_type.long, activity_type.short ' +
        'FROM category, activity_type ' +
        'WHERE category.weekid=$1 AND ' +
        'category.categoryid IS NOT NULL AND ' +
        'category.activityid IS NOT NULL AND ' +
        'category.activityid=activity_type.activityid AND ' +
        'category.userid=$2 AND ' +
        'category.userid=activity_type.userid ' +
        'GROUP BY category.categoryid, category.activityid, activity_type.long, activity_type.short'

    try {
        // Begin transaction
        await client.query("BEGIN")

        const totalPerWeekCategoryTypes: QueryResult = await client.query(getTotalPerWeekCategoryTypesQuery, [weekid, userid])
        const totalPerWeekActivityTypes: QueryResult = await client.query(getTotalPerWeekActivityTypesQuery, [weekid, userid])

        await client.query("COMMIT")
        return {status: 200, error: "", totalPerWeek: [{categoryTypes: totalPerWeekCategoryTypes.rows, activityTypes: totalPerWeekActivityTypes.rows}]}
    } catch (e) {
        await client.query("ROLLBACK")
        return {status: 400, error: e.message, totalPerWeek: []}
    } finally {
        client.release()
    }
}
