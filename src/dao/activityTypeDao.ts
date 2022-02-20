import * as i from 'types';
import { ActivityType } from '@prisma/client';
import { QueryResult } from 'pg';
import { v4 as uuid } from 'uuid';

import { client } from 'services';

import db from '../db/postgres';

/**
 * Queries
 */
export const getActivityTypesQuery = 'SELECT * FROM activity_type WHERE userid=$1 AND archived=false';

/**
 * Update given activity by activityid.
 * @param userid
 * @param activityType
 * @param activityid
 */
export const updateActivityType = async (
    userid: string,
    activityType: ActivityType,
    activityid: string,
): Promise<i.DaoResponse<ActivityType>> => {
    try {
        const updateActivityTypeQuery = 'UPDATE activity_type SET long=$1, short=$2, archived=$3 WHERE userid=$4 AND activityid=$5;';
        const updatedActivity: QueryResult = await db.query(updateActivityTypeQuery, [activityType.long, activityType.short, activityType.archived, userid, activityid]);

        if (updatedActivity.rowCount === 0) {
            return {
                status: 404,
                error: `Activity ${activityid} does not exist in the database.`,
                data: {} as ActivityType,
                success: true,
            };
        } else {
            return {
                status: 200,
                error: '',
                data: activityType,
                success: true,
            };
        }

    } catch (e: any) {
        return { status: 400, error: e.message, data: {} as ActivityType, success: false };
    }

};

/**
 * Fetches all category types for a given user.
 * @param userid of the user for which to fetch the category types.
 */
export const getActivityTypes = async (userid: string): Promise<i.DaoResponse<ActivityType[]>> => {
    try {
        const activityTypes = await client.activityType.findMany({
            where: {
                userid,
                archived: false,
            },
        });

        return {
            status: 200, data: activityTypes, error: '', success: true,
        };
    } catch (e: any) {
        return { status: 400, data: [], error: e.message, success: false };
    }
};

/**
 * Creates an activity type for a user.
 * @param userid of user for which to create the activity type.
 * @param activityType
 */
export const createActivityType = async (
    userid: string,
    activityType: ActivityType,
):Promise<i.DaoResponse<ActivityType>> => {
    try {
        const createActivityTypeQuery = 'INSERT INTO activity_type(activityid, categoryid, userid, long, short, archived) VALUES($1, $2, $3, $4, $5, $6)';
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
            error: '',
            success: true,
        };
    } catch (e: any) {
        return { status: 422, data: {} as ActivityType, error: e.message, success: false };
    }
};
