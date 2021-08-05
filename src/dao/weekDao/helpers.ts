// Internal imports
import {Category, Note} from "../../routes/public/week/week";

/**
 * Given an array of categories or notes, this function creates a double
 * array ordered by days (starting at monday and ending sunday). This is for
 * easier rendering on frontend.
 * @param items Note[] or Category[]
 * @return (Note | Category)[][]
 */
export const groupByDays = (items: Note[] | Category[]):any[][] => {
    let dayArrays:(Note | Category)[][] = [[], [], [], [], [], [], []]

    items.forEach(item => {
        dayArrays[item.weekDay].push(item)
    })
    return dayArrays
}