// External imports
import {v4 as uuid} from "uuid";

// Internal imports
import {CategoryType} from "../routes/categoryType";

const db = require("../db")

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
        let newCategoryType = await db.query(createUserQuery, values)
        return {status: 201, categoryType:{userid, categoryid, name, color, archived: false}}
    } catch (err) {
        return {status: 422, categoryType: null}
    }
}