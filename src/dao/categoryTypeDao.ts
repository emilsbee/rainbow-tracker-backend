// External imports
import {v4 as uuid} from "uuid";

// Internal imports
import {CategoryType} from "../routes/categoryType";
const db = require("../db")

/**
 * Fetches all category types for a given user.
 * @param userid of the user for which to fetch the category types.
 */
export const getCategoryTypes = async (userid:string):Promise<{ status:number, categoryTypes:CategoryType[] }> => {
    try {
        const getCategoryTypesQuery = "SELECT * FROM category_type WHERE user_id=$1"
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
export const createCategoryType = async (userid:string, color:string, name:string):Promise<{ status:number, categoryType:CategoryType }> => {
    try {
        const createUserQuery = "INSERT INTO category_type(category_id, user_id, color, name, archived) VALUES($1, $2, $3, $4, $5);"
        let categoryid = uuid()
        const values = [categoryid, userid, color, name, false]
        await db.query(createUserQuery, values)
        return {status: 201, categoryType:{userid, categoryid, name, color, archived: false}}
    } catch (err) {
        return {status: 422, categoryType: null}
    }
}