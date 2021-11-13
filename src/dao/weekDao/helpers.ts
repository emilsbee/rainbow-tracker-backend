import * as i from "types";

/**
 * Given an array of categories or notes, this function creates a double
 * array ordered by days (starting at monday and ending sunday). This is for
 * easier rendering on frontend.
 * @param items Note[] or Category[]
 * @return (Note | Category)[][]
 */
export const groupByDays = (items: i.Note[] | i.Category[]):any[][] => {
    const dayArrays:(i.Note | i.Category)[][] = [[], [], [], [], [], [], []];

    items.forEach((item) => {
        dayArrays[item.weekDay].push(item);
    });
    return dayArrays;
};
