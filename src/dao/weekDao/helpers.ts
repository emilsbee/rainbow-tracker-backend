// Internal imports
import {Category, Note} from "../../routes/week";

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
        // @ts-ignore because items are passed here straight from database, where they are stored like this: week_day while js has weekDay.
        dayArrays[item.week_day].push(item)
    })
    return dayArrays
}