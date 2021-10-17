// External imports
import {v4 as uuid} from "uuid";

// Internal imports
import db from "../db/postgres";
import {ActivityType} from "../routes/public/activityType";

/**
 * Queries
 */
export const getActivityTypesQuery = "SELECT * FROM activity_type WHERE userid=$1 AND archived=false"


/**
 * Update given activity by activityid.
 * @param userid
 * @param activityType
 * @param activityid
 */
export const updateActivityType = async (userid: string, activityType: ActivityType, activityid: string): Promise<{ status: number, error: string, activityType:ActivityType }> => {
    try {
        const updateActivityTypeQuery = "UPDATE activity_type SET long=$1, short=$2, archived=$3 WHERE userid=$4 AND activityid=$5;"
        let updatedActivity = await db.query(updateActivityTypeQuery, [activityType.long, activityType.short, activityType.archived, userid, activityid])

        if (updatedActivity.rowCount === 0) {
            return {
                status: 404,
                error: `Activity ${activityid} does not exist in the database.`,
                activityType: {} as ActivityType
            }
        } else {
            return {
                status: 200,
                error: "",
                activityType: activityType
            }
        }

    } catch (e: any) {
        return {status: 400, error: e.message, activityType: {} as ActivityType}
    }

}

/**
 * Fetches all category types for a given user.
 * @param userid of the user for which to fetch the category types.
 */
export const getActivityTypes = async (userid: string): Promise<{ status: number, activityTypes: ActivityType[], error: string }> => {
    try {
        let activityTypes = await db.query(getActivityTypesQuery, [userid])
        return {
            status: 200, activityTypes: activityTypes.rows, error: ""
        }
    } catch (e: any) {
        return {status: 400, activityTypes: [], error: e.message}
    }
}

/**
 * Creates an activity type for a user.
 * @param userid of user for which to create the activity type.
 * @param activityType
 */
export const createActivityType = async (userid: string, activityType: ActivityType):Promise<{ status: number, activityType: ActivityType, error: string }> => {
    try {
        const createActivityTypeQuery = "INSERT INTO activity_type(activityid, categoryid, userid, long, short, archived) VALUES($1, $2, $3, $4, $5, $6)"
        const activityid = uuid()
        const values = [activityid, activityType.categoryid, userid, activityType.long, activityType.short, activityType.archived]
        await db.query(createActivityTypeQuery, values)

        return {
            status: 201,
            activityType: {
                activityid,
                categoryid: activityType.categoryid,
                userid,
                long: activityType.long,
                short: activityType.short,
                archived: activityType.archived
            },
            error: ""
        }
    } catch (e: any) {
        return {status: 422, activityType: {} as ActivityType, error: e.message}
    }
}