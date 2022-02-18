import { activityType } from "@prisma/client";
import { QueryResult } from "pg";
import * as i from "types";
import { v4 as uuid } from "uuid";

import db from "../db/postgres";
import { client } from "../services";

/**
 * Queries
 */
export const getActivityTypesQuery = "SELECT * FROM activity_type WHERE userid=$1 AND archived=false";

/**
 * Update given activity by activityid.
 * @param userid
 * @param activityType
 * @param activityid
 */
export const updateActivityType = async (
    userid: string,
    activityType: i.ActivityType,
    activityid: string,
): Promise<i.DaoResponse<i.ActivityType>> => {
    try {
        const updateActivityTypeQuery = "UPDATE activity_type SET long=$1, short=$2, archived=$3 WHERE userid=$4 AND activityid=$5;";
        const updatedActivity: QueryResult = await db.query(updateActivityTypeQuery, [activityType.long, activityType.short, activityType.archived, userid, activityid]);

        if (updatedActivity.rowCount === 0) {
            return {
                status: 404,
                error: `Activity ${activityid} does not exist in the database.`,
                data: {} as i.ActivityType,
            };
        } else {
            return {
                status: 200,
                error: "",
                data: activityType,
            };
        }

    } catch (e: any) {
        return { status: 400, error: e.message, data: {} as i.ActivityType };
    }

};

/**
 * Fetches all category types for a given user.
 * @param userid of the user for which to fetch the category types.
 */
export const getActivityTypes = async (userid: string): Promise<i.DaoResponse<activityType[]>> => {
    try {
        const activityTypes = await client.activityType.findMany({
            where: {
                userid,
                archived: false,
            },
        });

        return {
            status: 200, data: activityTypes, error: "",
        };
    } catch (e: any) {
        return { status: 400, data: [], error: e.message };
    }
};

/**
 * Creates an activity type for a user.
 * @param userid of user for which to create the activity type.
 * @param activityType
 */
export const createActivityType = async (
    userid: string,
    activityType: i.ActivityType,
):Promise<i.DaoResponse<i.ActivityType>> => {
    try {
        const createActivityTypeQuery = "INSERT INTO activity_type(activityid, categoryid, userid, long, short, archived) VALUES($1, $2, $3, $4, $5, $6)";
        const activityid = uuid();
        const values = [activityid, activityType.categoryid, userid, activityType.long, activityType.short, activityType.archived];
        await db.query(createActivityTypeQuery, values);

        return {
            status: 201,
            data: {
                activityid,
                categoryid: activityType.categoryid,
                userid,
                long: activityType.long,
                short: activityType.short,
                archived: activityType.archived,
            },
            error: "",
        };
    } catch (e: any) {
        return { status: 422, data: {} as i.ActivityType, error: e.message };
    }
};
