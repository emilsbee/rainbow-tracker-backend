import * as i from 'types';
import { PoolClient, QueryResult } from 'pg';
import { v4 as uuid } from 'uuid';
import { ActivityType, CategoryType } from '@prisma/client';

import { sortActivityTypesByArchived, sortCategoryTypesByArchived } from 'services';

import db from '../../db/postgres';

/**
 * Archives a category type by a given categoryid. Also, archives all the activity types
 * for the category.
 * @param userid for which to archive the category type.
 * @param categoryid of the category to archive.
 */
export const archiveCategoryType = async (userid: string, categoryid: string): Promise<i.DaoResponse<null>> => {
    const client: PoolClient = await db.getClient();

    try {
        // Begin transaction
        await client.query('BEGIN');

        const archiveActivityTypeQuery = 'UPDATE activity_type SET archived=true WHERE categoryid=$1 AND userid=$2';
        await client.query(archiveActivityTypeQuery, [categoryid, userid]);

        const archiveCategoryTypeQuery = 'UPDATE category_type SET archived=true WHERE categoryid=$1 AND userid=$2';
        const categoryRes: QueryResult = await client.query(archiveCategoryTypeQuery, [categoryid, userid]);

        // Commit transaction
        await client.query('COMMIT');

        if (categoryRes.rowCount === 0) {
            return { status: 404, error: `Category ${categoryid} does not exist in the database.`, data: null, success: true };
        } else {
            return { status: 204, error: '', data: null, success: true };
        }
    } catch (e: any) {
        await client.query('ROLLBACK');
        return { status: 400, error: e.message, data: null, success: false };
    } finally {
        client.release();
    }
};

/**
 * Update category type for a given user.
 * @param userid for which to update category type.
 * @param newCategoryType to update with.
 * @param categoryid of category to update.
 */
export const updateCategoryType = async (
    userid: string,
    newCategoryType: CategoryType,
    categoryid: string,
): Promise<i.DaoResponse<CategoryType>> => {
    let categoryType = {} as CategoryType;

    try {
        const updateCategoryTypeQuery = 'UPDATE category_type SET color=$1, name=$2 WHERE userid=$3 AND categoryid=$4;';
        const updatedCategory: QueryResult = await db.query(updateCategoryTypeQuery, [newCategoryType.color, newCategoryType.name, userid, categoryid]);

        if (updatedCategory.rowCount === 0) {
            return {
                status: 404,
                data: categoryType,
                error: `Category type ${categoryid} for update was not found.`,
                success: true,
            };
        } else {
            categoryType = {
                categoryid,
                name: newCategoryType.name,
                color: newCategoryType.color,
                archived: false,
                userid,
            };

            return {
                status: 200,
                data: categoryType,
                error: '',
                success: true,
            };
        }
    } catch (e: any) {
        return { status: 400, data: categoryType, error: e.message, success: false };
    }
};

/**
 * Fetches all category types for a given user.
 * @param userid of the user for which to fetch the category types.
 */
export const getCategoryTypes = async (userid: string): Promise<i.DaoResponse<CategoryType[]>> => {
    try {
        const getCategoryTypesQuery = 'SELECT * FROM category_type WHERE userid=$1 AND archived=false';
        const newCategoryTypes: QueryResult<CategoryType> = await db.query(getCategoryTypesQuery, [userid]);
        return {
            status: 200, data: newCategoryTypes.rows, error: '', success: true,
        };
    } catch (e: any) {
        return { status: 400, data: [], error: e.message, success: false };
    }
};

/**
 * Fetches all category types and all activity types for a given user.
 * @param userid of the user for which to fetch the category and activity types.
 */
export const getCategoryTypesFull = async (
    userid: string,
): Promise<i.DaoResponse<{ categoryTypes: CategoryType[], activityTypes: ActivityType[] }>> => {
    const client: PoolClient = await db.getClient();

    try {
        // Begin transaction
        await client.query('BEGIN');

        const getCategoryTypesQuery = 'SELECT * FROM category_type WHERE userid=$1';
        const getActivityTypesQuery = 'SELECT * FROM activity_type WHERE userid=$1';
        const categoryTypes: QueryResult<CategoryType> = await client.query(getCategoryTypesQuery, [userid]);
        const activityTypes: QueryResult<ActivityType> = await client.query(getActivityTypesQuery, [userid]);

        await client.query('COMMIT');

        return {
            status: 200,
            data: {
                categoryTypes: sortCategoryTypesByArchived(categoryTypes.rows),
                activityTypes: sortActivityTypesByArchived(activityTypes.rows),
            },
            error: '',
            success: true,
        };
    } catch (e: any) {
        await client.query('ROLLBACK');
        return { status: 400, data: { categoryTypes: [], activityTypes: [] }, error: e.message, success: false };
    } finally {
        client.release();
    }
};

/**
 * Creates a category type for a user.
 * @param userid of user for which to create the category type.
 * @param color of the category type to create.
 * @param name of the category type to create.
 */
export const createCategoryType = async (
    userid: string,
    color: string,
    name: string,
): Promise<i.DaoResponse<CategoryType[]>> => {
    try {
        const createCategoryTypeQuery = 'INSERT INTO category_type(categoryid, userid, color, name, archived) VALUES($1, $2, $3, $4, $5);';
        const categoryid = uuid();
        const values = [categoryid, userid, color, name, false];
        await db.query(createCategoryTypeQuery, values);
        return { status: 201, data: [{ userid, categoryid, name, color, archived: false }], error: '', success: true };
    } catch (err: any) {
        return { status: 422, data: [], error: err.message, success: false };
    }
};

/**
 * Restores category type from being archived as well as all its activities.
 * @param userid
 * @param categoryid
 */
export const restoreCategoryType = async (userid: string, categoryid: string): Promise<i.DaoResponse<null>> => {
    const client: PoolClient = await db.getClient();

    try {
        // Begin transaction
        await client.query('BEGIN');

        const restoreCategoryTypeQuery = 'UPDATE category_type SET archived=false WHERE userid=$1 AND categoryid=$2;';
        const restoreActivityTypesQuery = 'UPDATE activity_type SET archived=false WHERE userid=$1 AND categoryid=$2;';

        const restoredCategoryType:QueryResult = await client.query(restoreCategoryTypeQuery, [userid, categoryid]);
        await client.query(restoreActivityTypesQuery, [userid, categoryid]);

        if (restoredCategoryType.rowCount === 0) {
            return { status: 404, error: `Could not find given category with categoryid: ${categoryid}.`, data: null, success: true };
        }

        await client.query('COMMIT');

        return { status: 200, error: '', data: null, success: true };
    } catch (e: any) {
        await client.query('ROLLBACK');
        return { status: 400, error: e.message, data: null, success: false };
    } finally {
        client.release();
    }
};
