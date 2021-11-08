import * as i from "types";
import { PoolClient, QueryResult } from "pg";

import db from "../../db/postgres";
import { findActivityAggregateCount, findTotalCountForCategory } from "./helpers";

/**
 * This type is specific to the function below.
 */
type AvailableDate = {
    year: number,
    weeks: number[]
}
/**
 * Fetches the available years and the respective weeks that user has created. Not the actual week (like categories, note) but
 * literally the years and week numbers that have been created.
 * @param userid for which to fetch available dates.
 */
export const getAvailableDates = async (userid: string): Promise<{ status: number, error: string, availableDates: AvailableDate[] }> => {
    const client: PoolClient = await db.getClient();

    try {
        // Begin transaction
        await client.query("BEGIN");

        const getAvailableYearsQuery = "SELECT DISTINCT \"weekYear\" FROM week WHERE userid=$1 ORDER BY \"weekYear\" DESC;";
        const getAvailableWeeksOfYearQuery = "SELECT \"weekNr\" FROM week WHERE userid=$1 AND \"weekYear\"=$2 ORDER BY \"weekNr\" DESC;";

        const yearRes = await client.query(getAvailableYearsQuery, [userid]);

        const availableDates: AvailableDate[] = [];
        if (yearRes.rowCount !== 0) {
            for (let i = 0; i < yearRes.rowCount; i++) {
                const weekRes = await client.query(getAvailableWeeksOfYearQuery, [userid, yearRes.rows[i].weekYear]);
                availableDates.push({ year: yearRes.rows[i].weekYear, weeks: weekRes.rows.flatMap((availableDate) => availableDate.weekNr) });
            }
        }

        await client.query("COMMIT");

        return {
            status: 200,
            error: "",
            availableDates,
        };
    } catch (e: any) {
        await client.query("ROLLBACK");
        return { status: 400, error: e.message, availableDates: [] };
    } finally {
        client.release();
    }
};


/**
 * This type is specific to the return statement of function below.
 */
type TotalPerWeekActivityType = i.ActivityType & { count: number }
type TotalPerWeekCategoryType = i.CategoryType & {count: number }
export type TotalPerWeek = {
    categoryTypes: TotalPerWeekCategoryType[],
    activityTypes: TotalPerWeekActivityType[]
}

/**
 * Fetches the amount of time spent on each category type and activity type
 * for a given week. In the return type, amount symbolizes the amount of 15
 * minute intervals.
 * @param userid of the user for which to find the total per week.
 * @param weekid of the week for which to find the total per week.
 */
export const getTotalPerWeek = async (userid: string, weekid: string): Promise<{ status: number, error: string, totalPerWeek: TotalPerWeek }> => {
    const client: PoolClient = await db.getClient();

    const getTotalPerWeekCategoryTypesQuery = "SELECT category.categoryid, COUNT(category.categoryid)::int, category_type.name, category_type.color, category_type.userid, category_type.archived " +
        "FROM category, category_type " +
        "WHERE category.weekid=$1 AND " +
        "category.userid=$2 AND " +
        "category_type.userid=category.userid AND " +
        "category.categoryid=category_type.categoryid " +
        "GROUP BY category.categoryid, category_type.name, category_type.color, category_type.userid, category_type.archived;";

    const getTotalPerWeekActivityTypesQuery = "SELECT category.categoryid, category.activityid, COUNT(category.activityid)::int, activity_type.long, activity_type.short, activity_type.userid, activity_type.archived " +
        "FROM category, activity_type " +
        "WHERE category.weekid=$1 AND " +
        "category.activityid=activity_type.activityid AND " +
        "category.userid=$2 AND " +
        "category.userid=activity_type.userid " +
        "GROUP BY category.categoryid, category.activityid, activity_type.long, activity_type.short, activity_type.userid, activity_type.archived";

    try {
        // Begin transaction
        await client.query("BEGIN");

        const totalPerWeekCategoryTypesRows: QueryResult = await client.query(getTotalPerWeekCategoryTypesQuery, [weekid, userid]);
        const totalPerWeekActivityTypesRows: QueryResult = await client.query(getTotalPerWeekActivityTypesQuery, [weekid, userid]);

        await client.query("COMMIT");

        const totalPerWeekCategoryTypes = totalPerWeekCategoryTypesRows.rows as unknown as TotalPerWeek["categoryTypes"];
        const totalPerWeekActivityTypes = totalPerWeekActivityTypesRows.rows as unknown as TotalPerWeek["activityTypes"];

        // Creating empty activities
        for (let i = 0; i < totalPerWeekCategoryTypes.length; i++) {
            const categoryTotal:number = findTotalCountForCategory(totalPerWeekCategoryTypes, totalPerWeekCategoryTypes[i].categoryid);
            const activityTotal:number = findActivityAggregateCount(totalPerWeekActivityTypes, totalPerWeekCategoryTypes[i].categoryid);

            const emptyActivity:TotalPerWeekActivityType = {
                activityid: "Other", archived: false, categoryid: totalPerWeekCategoryTypes[i].categoryid, count: categoryTotal - activityTotal, long: "Other", short: "o", userid: totalPerWeekCategoryTypes[i].userid,
            };

            totalPerWeekActivityTypes.push(emptyActivity);
        }

        if (totalPerWeekCategoryTypesRows.rowCount === 0) {
            return {
                status: 404,
                error: "This week has no analytics.",
                totalPerWeek: {
                    categoryTypes: [],
                    activityTypes: [],
                },
            };
        }

        return {
            status: 200,
            error: "",
            totalPerWeek: {
                categoryTypes: totalPerWeekCategoryTypes,
                activityTypes: totalPerWeekActivityTypes,
            },
        };
    } catch (e: any) {
        await client.query("ROLLBACK");
        return { status: 400, error: e.message, totalPerWeek: {
                categoryTypes: [],
                activityTypes: [],
            } };
    } finally {
        client.release();
    }
};

/**
 * This type is specific to the function below.
 */
type TotalPerDay = {
    weekDay: number
    categories: {
        categoryid: string | null
        count: number
        weekDay: number
        name: string
    }[]
    activities: {
        activityid: string | null
        count: number
        weekDay: number
    }[]
}
/**
 * Fetches the amount of time spent on each category type and activity type
 * for a given week in each day. In the return type, amount symbolizes the amount of 15
 * minute intervals.
 * @param userid of the user for which to find the total  per day.
 * @param weekid of the week for which to find the total per day.
 */
export const getTotalPerDay = async (userid: string, weekid: string): Promise<{ status: number, error: string, totalPerDay: TotalPerDay[] }> => {
    const client: PoolClient = await db.getClient();
    const totalPerDay: TotalPerDay[] = [
        { weekDay: 0, categories: [], activities: [] },
        { weekDay: 1, categories: [], activities: [] },
        { weekDay: 2, categories: [], activities: [] },
        { weekDay: 3, categories: [], activities: [] },
        { weekDay: 4, categories: [], activities: [] },
        { weekDay: 5, categories: [], activities: [] },
        { weekDay: 6, categories: [], activities: [] },
    ];

    const getTotalPerDayCategoriesQuery = "SELECT category.categoryid, COUNT(category.\"weekDay\")::int, \"categoryType\".name\n" +
        "FROM category, (SELECT * FROM category_type WHERE userid=$1) AS \"categoryType\" \n" +
        "WHERE category.userid=$2 \n" +
        "AND category.weekid=$3\n" +
        "AND category.\"weekDay\"=$4\n" +
        "AND \"categoryType\".categoryid=category.categoryid \n" +
        "GROUP BY category.categoryid, \"categoryType\".name";

    const getTotalPerDayActivitiesQuery = "SELECT activityid, COUNT(\"weekDay\")::int\n" +
        "FROM category \n" +
        "WHERE userid=$1 \n" +
        "AND weekid=$2\n" +
        "AND \"weekDay\"=$3\n" +
        "GROUP BY activityid";


    try {
        // Begin transaction
        await client.query("BEGIN");

        for (let i = 0; i < totalPerDay.length; i++) {
            const totalPerDayCategories = await client.query(getTotalPerDayCategoriesQuery, [userid, userid, weekid, i]);
            const totalPerDayActivities = await client.query(getTotalPerDayActivitiesQuery, [userid, weekid, i]);

            totalPerDay[i].categories = totalPerDayCategories.rows;
            totalPerDay[i].categories.forEach((category) => category.weekDay = i);
            totalPerDay[i].activities = totalPerDayActivities.rows;
            totalPerDay[i].activities.forEach((activity) => activity.weekDay = i);
        }

        await client.query("COMMIT");

        return {
            status: 200,
            error: "",
            totalPerDay,
        };
    } catch (e: any) {
        await client.query("ROLLBACK");
        return { status: 400, error: e.message, totalPerDay };
    } finally {
        client.release();
    }
};

type AvailableMonth = {
    year: number
    month: number // 1-12
    weekNr: number
}

export const getAvailableMonths = async (userid: string):Promise<{ status: number, error: string, availableMonths: AvailableMonth[] }> => {
    try {
        const getAvailableMonthsQuery = "SELECT DISTINCT date_part('month', \"weekDayDate\") AS \"month\", date_part('year', \"weekDayDate\") AS \"year\", date_part('week', \"weekDayDate\") as \"weekNr\" \n" +
            "FROM category \n" +
            "WHERE userid=$1 " +
            "ORDER BY \"year\" DESC;";

        const availableMonths:QueryResult = await db.query(getAvailableMonthsQuery, [userid]);

        return { status: 200, error: "", availableMonths: availableMonths.rows };
    } catch (e:any) {
        return { status: 400, error: e.message, availableMonths: [] };
    }
};

type TotalPerMonthActivityType = i.ActivityType & { count: number }
type TotalPerMonthCategoryType = i.CategoryType & {count: number }
export type TotalPerMonth = {
    categoryTypes: TotalPerMonthCategoryType[],
    activityTypes: TotalPerMonthActivityType[]
}

export const getTotalPerMonth = async (userid: string, month: number, year: number):Promise<{ status: number, error: string, totalPerMonth: TotalPerMonth}> => {
    const client: PoolClient = await db.getClient();

    const getTotalPerMonthCategoryQuery = "SELECT category.categoryid, COUNT(category.categoryid)::int, category_type.name, category_type.color, category_type.userid, category_type.archived " +
        "FROM category, category_type " +
        "WHERE date_part('month', category.\"weekDayDate\")=$1 AND " +
        "date_part('year', category.\"weekDayDate\")=$2 AND " +
        "category.userid=$3 AND " +
        "category_type.userid=category.userid AND " +
        "category.categoryid=category_type.categoryid " +
        "GROUP BY category.categoryid, category_type.name, category_type.color, category_type.userid, category_type.archived;";

    const getTotalPerMonthActivityQuery = "SELECT category.categoryid, category.activityid, COUNT(category.activityid)::int, activity_type.long, activity_type.short, activity_type.userid, activity_type.archived " +
        "FROM category, activity_type " +
        "WHERE date_part('month', category.\"weekDayDate\")=$1 AND " +
        "date_part('year', category.\"weekDayDate\")=$2 AND " +
        "category.activityid=activity_type.activityid AND " +
        "category.userid=$3 AND " +
        "category.userid=activity_type.userid " +
        "GROUP BY category.categoryid, category.activityid, activity_type.long, activity_type.short, activity_type.userid, activity_type.archived";

    try {
        // Begin transaction
        await client.query("BEGIN");

        const totalPerMonthCategoryRows:QueryResult = await client.query(getTotalPerMonthCategoryQuery, [month, year, userid]);
        const totalPerMonthActivityRows:QueryResult = await client.query(getTotalPerMonthActivityQuery, [month, year, userid]);

        await client.query("COMMIT");

        const totalPerMonthCategory = totalPerMonthCategoryRows.rows as unknown as TotalPerMonth["categoryTypes"];
        const totalPerMonthActivity = totalPerMonthActivityRows.rows as unknown as TotalPerMonth["activityTypes"];

        // Creating empty activities
        for (let i = 0; i < totalPerMonthCategory.length; i++) {
            const categoryTotal:number = findTotalCountForCategory(totalPerMonthCategory, totalPerMonthCategory[i].categoryid);
            const activityTotal:number = findActivityAggregateCount(totalPerMonthActivity, totalPerMonthCategory[i].categoryid);

            const emptyActivity:TotalPerWeekActivityType = {
                activityid: "Other", archived: false, categoryid: totalPerMonthCategory[i].categoryid, count: categoryTotal - activityTotal, long: "Other", short: "o", userid: totalPerMonthCategory[i].userid,
            };

            totalPerMonthActivity.push(emptyActivity);
        }

        if (totalPerMonthCategoryRows.rowCount === 0) {
            return {
                status: 404,
                error: "This week has no analytics.",
                totalPerMonth: {
                    categoryTypes: [],
                    activityTypes: [],
                },
            };
        }

        return { status: 200, error: "", totalPerMonth: { categoryTypes: totalPerMonthCategory, activityTypes: totalPerMonthActivity } };
    } catch (e: any) {
        await client.query("ROLLBACK");
        return { status: 400, error: e.message, totalPerMonth: {} as TotalPerMonth };
    } finally {
        client.release();
    }
};

type TotalPerDaySpecific = {
    weekDay: number
    categories: {
        categoryid: string | null
        count: number
        name: string
        color: string
    }[]
}

export const getTotalPerDaySpecific = async (userid: string, day: number, weekNr: number, year: number):Promise<{ status: number, error: string, totalPerDaySpecific: TotalPerDaySpecific }> => {
    try {
        const getTotalPerDaySpecificQuery = "SELECT category.categoryid, COUNT(category.\"weekDay\")::int, \"categoryType\".name, \"categoryType\".color \n" +
            "FROM category, (SELECT * FROM category_type WHERE userid=$1) AS \"categoryType\" \n" +
            "WHERE category.userid=$2 \n" +
            "AND date_part('year', category.\"weekDayDate\")=$3\n" +
            "AND date_part('week', category.\"weekDayDate\")=$4 \n" +
            "AND category.\"weekDay\"=$5\n" +
            "AND \"categoryType\".categoryid=category.categoryid \n" +
            "GROUP BY category.categoryid, \"categoryType\".name, \"categoryType\".color";

        const totalPerDaySpecific = await db.query(getTotalPerDaySpecificQuery, [userid, userid, year, weekNr, day]);

        if (totalPerDaySpecific.rowCount === 0) {
            return { status: 404, error: `No categories have been added for day ${day} in week ${weekNr} in year ${year}`, totalPerDaySpecific: {} as TotalPerDaySpecific };
        }

        return { status: 200, error: "", totalPerDaySpecific: { weekDay: day, categories: totalPerDaySpecific.rows } };
    } catch (e: any) {
        return { status: 400, error: e.message, totalPerDaySpecific: {} as TotalPerDaySpecific };
    }
};
