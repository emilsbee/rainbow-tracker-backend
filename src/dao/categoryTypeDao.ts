// External imports
import {v4 as uuid} from "uuid";

// Internal imports
import {CategoryType} from "../routes/public/categoryType";
import {PoolClient} from "pg";
import db from "../db"

/**
 * Archives a category type by a given categoryid. Also, archives all the activity types
 * for the category.
 * @param userid for which to archive the category type.
 * @param categoryid of the category to archive.
 */
export const deleteCategoryType = async (userid:string, categoryid:string):Promise<number> => {
    const client:PoolClient = await db.getClient()

    try {
        // Begin transaction
        await client.query('BEGIN')

        const archiveActivityTypeQuery = "UPDATE activity_type SET archived=true WHERE categoryid=$1 AND userid=$2"
        await client.query(archiveActivityTypeQuery, [categoryid, userid])

        const archiveCategoryTypeQuery = "UPDATE category_type SET archived=true WHERE categoryid=$1 AND userid=$2"
        await client.query(archiveCategoryTypeQuery, [categoryid, userid])

        // Commit transaction
        await client.query('COMMIT')

        return 204
    } catch (e) {
        await client.query('ROLLBACK')
        return 400
    } finally {
        client.release()
    }
}

/**
 * Update category type for a given user.
 * @param userid for which to update category type.
 * @param newCategoryType to update with.
 */
export const updateCategoryType = async (userid:string, newCategoryType:CategoryType):Promise<{ status:number, categoryType:CategoryType[] }> => {
    try {
        const updateCategoryTypeQuery = "UPDATE category_type SET color=$1, name=$2 WHERE userid=$3 AND categoryid=$4;"
        let updatedCategory = await db.query(updateCategoryTypeQuery, [newCategoryType.color, newCategoryType.name, userid, newCategoryType.categoryid])

        if (updatedCategory.rowCount === 0) {
            return {
                status: 404,
                categoryType: []
            }
        } else {
            return {
                status: 200, categoryType: updatedCategory.rows
            }
        }
    } catch (e) {
        return {status: 400, categoryType:[]}
    }
}

/**
 * Fetches all category types for a given user.
 * @param userid of the user for which to fetch the category types.
 */
export const getCategoryTypes = async (userid:string):Promise<{ status:number, categoryTypes:CategoryType[] }> => {
    try {
        const getCategoryTypesQuery = "SELECT * FROM category_type WHERE userid=$1 AND archived=false"
        let newCategoryTypes = await db.query(getCategoryTypesQuery, [userid])
        return {
            status:200, categoryTypes: newCategoryTypes.rows
        }
    } catch (e) {
        return {status: 400, categoryTypes:[]}
    }
}

/**
 * Creates a category type for a user.
 * @param userid of user for which to create the category type.
 * @param color of the category type to create.
 * @param name of the category type to create.
 */
export const createCategoryType = async (userid:string, color:string, name:string):Promise<{ status:number, categoryType:CategoryType[] }> => {
    try {
        const createUserQuery = "INSERT INTO category_type(categoryid, userid, color, name, archived) VALUES($1, $2, $3, $4, $5);"
        let categoryid = uuid()
        const values = [categoryid, userid, color, name, false]
        await db.query(createUserQuery, values)
        return {status: 201, categoryType:[{userid, categoryid, name, color, archived: false}]}
    } catch (err) {
        return {status: 422, categoryType: []}
    }
}