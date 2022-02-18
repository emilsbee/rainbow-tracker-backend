import { category, note } from "@prisma/client";

/**
 * Given an array of categories or notes, this function creates a double
 * array ordered by days (starting at monday and ending sunday). This is for
 * easier rendering on frontend.
 * @param items Note[] or Category[]
 * @return (Note | Category)[][]
 */
export const groupByDays = <T extends { weekDay: number }> (items: T[]):T[][] => {
    const dayArrays: T[][] = [[], [], [], [], [], [], []];

    items.forEach((item) => {
        dayArrays[item.weekDay].push(item);
    });
    return dayArrays;
};
