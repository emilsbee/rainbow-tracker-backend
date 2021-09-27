// External imports
import {v4 as uuid} from "uuid";

// Internal imports
import db from "../db/postgres";
import {ActivityType} from "../routes/public/activityType";
import user from "../routes/admin/user";

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
export const updateActivityType = async (userid: string, activityType: ActivityType, activityid: string): Promise<{ status: number, error: string, activityType:ActivityType[] }> => {
    try {
        const updateActivityTypeQuery = "UPDATE activity_type SET long=$1, short=$2 WHERE userid=$3 AND activityid=$4;"
        let updatedActivity = await db.query(updateActivityTypeQuery, [activityType.long, activityType.short, userid, activityid])

        if (updatedActivity.rowCount === 0) {
            return {
                status: 404,
                error: `Activity ${activityid} does not exist in the database.`,
                activityType: []
            }
        } else {
            return {
                status: 200,
                error: "",
                activityType: [{...activityType, archived: false, userid}]
            }
        }

    } catch (e: any) {
        return {status: 400, error: e.message, activityType:[]}
    }

}

/**
 * Deletes given activity by activityid.
 * @param userid
 * @param activityid
 */
export const deleteActivityType = async (userid: string, activityid: string): Promise<{ status: number, error: string }> => {
    try {
        const archiveActivityTypeQuery = "UPDATE activity_type SET archived=true WHERE activityid=$1 AND userid=$2"
        let activityRes = await db.query(archiveActivityTypeQuery, [activityid, userid])

        if (activityRes.rowCount === 0) {
            return {status: 404, error: `Activity ${activityid} does not exist in the database.`}
        } else {
            return {status: 204, error: ""}
        }
    } catch (e: any) {
        return {status: 400, error: e.message}
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
 * @param categoryid  of the category for which to create the activity type.
 * @param long explanation of the activity type to create.
 * @param short 2 letter abbreviation of the activity type to create.
 */
export const createActivityType = async (userid: string, categoryid: string, long: string, short: string):Promise<{ status: number, activityType: ActivityType[], error: string }> => {
    try {
        const createActivityTypeQuery = "INSERT INTO activity_type(activityid, categoryid, userid, long, short, archived) VALUES($1, $2, $3, $4, $5, $6)"
        const activityid = uuid()
        const values = [activityid, categoryid, userid, long, short, false]
        await db.query(createActivityTypeQuery, values)

        return {status: 201, activityType: [{activityid, categoryid, userid, long, short, archived: false}], error: ""}
    } catch (e: any) {
        return {status: 422, activityType:[], error: e.message}
    }
}