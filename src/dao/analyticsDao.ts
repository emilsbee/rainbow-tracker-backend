// External imports
import {PoolClient, QueryResult} from "pg";

// Internal imports
import db from "../db/postgres"
import {ActivityType} from "../routes/public/activityType";
import {findActivityAggregateCount, findTotalCountForCategory} from "./analyticsDao/helpers";
import {CategoryType} from "../routes/public/categoryType";

/**
 * This type is specific to the function below.
 */
type AvailableDate = {
    year: number,
    weeks: number[]
}
/**
 * Fetches the available years and the respective weeks that user has created. Not the actual week (like categories, note) but
 * literally the years and week numbers that have been created.
 * @param userid for which to fetch available dates.
 */
export const getAvailableDates = async (userid: string): Promise<{ status: number, error: string, availableDates: AvailableDate[] }> => {
    const client: PoolClient = await db.getClient()

    try {
        // Begin transaction
        await client.query("BEGIN")

        const getAvailableYearsQuery = 'SELECT DISTINCT "weekYear" FROM week WHERE userid=$1 ORDER BY "weekYear" DESC;'
        const getAvailableWeeksOfYearQuery = 'SELECT "weekNr" FROM week WHERE userid=$1 AND "weekYear"=$2 ORDER BY "weekNr" DESC;'

        const yearRes = await client.query(getAvailableYearsQuery, [userid])

        let availableDates: AvailableDate[] = []
        if (yearRes.rowCount !== 0) {
            for (let i = 0; i < yearRes.rowCount; i++) {
                let weekRes = await client.query(getAvailableWeeksOfYearQuery, [userid, yearRes.rows[i].weekYear])
                availableDates.push({year: yearRes.rows[i].weekYear, weeks: weekRes.rows.flatMap(availableDate => availableDate.weekNr)})
            }
        }

        await client.query("COMMIT")

        return {
            status: 200,
            error: "",
            availableDates
        }
    } catch (e: any) {
        await client.query("ROLLBACK")
        return {status: 400, error: e.message, availableDates: []}
    } finally {
        client.release()
    }
}


/**
 * This type is specific to the return statement of function below.
 */
type TotalPerWeekActivityType = ActivityType & { count: number }
type TotalPerWeekCategoryType = CategoryType & {count: number }
export type TotalPerWeek = {
    categoryTypes: TotalPerWeekCategoryType[],
    activityTypes: TotalPerWeekActivityType[]
}

/**
 * Fetches the amount of time spent on each category type and activity type
 * for a given week. In the return type, amount symbolizes the amount of 15
 * minute intervals.
 * @param userid of the user for which to find the total per week.
 * @param weekid of the week for which to find the total per week.
 */
export const getTotalPerWeek = async (userid: string, weekid: string): Promise<{ status: number, error: string, totalPerWeek: TotalPerWeek }> => {
    const client: PoolClient = await db.getClient()

    const getTotalPerWeekCategoryTypesQuery = 'SELECT category.categoryid, COUNT(category.categoryid)::int, category_type.name, category_type.color, category_type.userid, category_type.archived ' +
        'FROM category, category_type ' +
        'WHERE category.weekid=$1 AND ' +
        'category.userid=$2 AND ' +
        'category_type.userid=category.userid AND ' +
        'category.categoryid=category_type.categoryid ' +
        'GROUP BY category.categoryid, category_type.name, category_type.color, category_type.userid, category_type.archived;'

    const getTotalPerWeekActivityTypesQuery = 'SELECT category.categoryid, category.activityid, COUNT(category.activityid)::int, activity_type.long, activity_type.short, activity_type.userid, activity_type.archived ' +
        'FROM category, activity_type ' +
        'WHERE category.weekid=$1 AND ' +
        'category.activityid=activity_type.activityid AND ' +
        'category.userid=$2 AND ' +
        'category.userid=activity_type.userid ' +
        'GROUP BY category.categoryid, category.activityid, activity_type.long, activity_type.short, activity_type.userid, activity_type.archived'

    try {
        // Begin transaction
        await client.query("BEGIN")

        const totalPerWeekCategoryTypesRows: QueryResult = await client.query(getTotalPerWeekCategoryTypesQuery, [weekid, userid])
        const totalPerWeekActivityTypesRows: QueryResult = await client.query(getTotalPerWeekActivityTypesQuery, [weekid, userid])

        await client.query("COMMIT")

        const totalPerWeekCategoryTypes = totalPerWeekCategoryTypesRows.rows as unknown as TotalPerWeek["categoryTypes"]
        const totalPerWeekActivityTypes = totalPerWeekActivityTypesRows.rows as unknown as TotalPerWeek["activityTypes"]

        // Creating empty activities
        for (let i = 0; i < totalPerWeekCategoryTypes.length; i++) {
            let categoryTotal:number = findTotalCountForCategory(totalPerWeekCategoryTypes, totalPerWeekCategoryTypes[i].categoryid)
            let activityTotal:number = findActivityAggregateCount(totalPerWeekActivityTypes, totalPerWeekCategoryTypes[i].categoryid)

            let emptyActivity:TotalPerWeekActivityType = {
                activityid: "Empty", archived: false, categoryid: totalPerWeekCategoryTypes[i].categoryid, count: categoryTotal-activityTotal, long: "Empty", short: "ep", userid: totalPerWeekCategoryTypes[i].userid
            }

            totalPerWeekActivityTypes.push(emptyActivity)
        }

        return {
            status: 200,
            error: "",
            totalPerWeek: {
                categoryTypes: totalPerWeekCategoryTypes,
                activityTypes: totalPerWeekActivityTypes
            }
        }
    } catch (e: any) {
        await client.query("ROLLBACK")
        console.log(e.message)
        return {status: 400, error: e.message, totalPerWeek: {
                categoryTypes: [],
                activityTypes: []
            }}
    } finally {
        client.release()
    }
}

/**
 * This type is specific to the function below.
 */
type TotalPerDay = {
    weekDay: number
    categories: {
        categoryid: string | null
        count: number
        weekDay: number
        name: string
    }[]
    activities: {
        activityid: string | null
        count: number
        weekDay: number
    }[]
}
/**
 * Fetches the amount of time spent on each category type and activity type
 * for a given week in each day. In the return type, amount symbolizes the amount of 15
 * minute intervals.
 * @param userid of the user for which to find the total  per day.
 * @param weekid of the week for which to find the total per day.
 */
export const getTotalPerDay = async (userid: string, weekid: string): Promise<{ status: number, error: string, totalPerDay: TotalPerDay[] }> => {
    const client: PoolClient = await db.getClient()
    const totalPerDay: TotalPerDay[] = [
        {weekDay: 0, categories: [], activities: []},
        {weekDay: 1, categories: [], activities: []},
        {weekDay: 2, categories: [], activities: []},
        {weekDay: 3, categories: [], activities: []},
        {weekDay: 4, categories: [], activities: []},
        {weekDay: 5, categories: [], activities: []},
        {weekDay: 6, categories: [], activities: []}
    ]

    const getTotalPerDayCategoriesQuery = 'SELECT category.categoryid, COUNT(category."weekDay")::int, "categoryType".name\n' +
        'FROM category, (SELECT * FROM category_type WHERE userid=$1) AS "categoryType" \n' +
        'WHERE category.userid=$2 \n' +
        'AND category.weekid=$3\n' +
        'AND category."weekDay"=$4\n' +
        'AND "categoryType".categoryid=category.categoryid \n' +
        'GROUP BY category.categoryid, "categoryType".name'

    const getTotalPerDayActivitiesQuery = 'SELECT activityid, COUNT("weekDay")::int\n' +
        'FROM category \n' +
        'WHERE userid=$1 \n' +
        'AND weekid=$2\n' +
        'AND "weekDay"=$3\n' +
        'GROUP BY activityid'


    try {
        // Begin transaction
        await client.query("BEGIN")

        for (let i = 0; i < totalPerDay.length; i++) {
            let totalPerDayCategories = await client.query(getTotalPerDayCategoriesQuery, [userid, userid, weekid, i])
            let totalPerDayActivities = await client.query(getTotalPerDayActivitiesQuery, [userid, weekid, i])

            totalPerDay[i].categories = totalPerDayCategories.rows
            totalPerDay[i].categories.forEach(category => category.weekDay = i)
            totalPerDay[i].activities = totalPerDayActivities.rows
            totalPerDay[i].activities.forEach(activity => activity.weekDay = i)
        }

        await client.query("COMMIT")

        return {
            status: 200,
            error: "",
            totalPerDay
        }
    } catch (e: any) {
        await client.query("ROLLBACK")
        return {status: 400, error: e.message, totalPerDay}
    } finally {
        client.release()
    }
}