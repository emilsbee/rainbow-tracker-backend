import * as i from "types";
import { PoolClient, QueryResult } from "pg";

import db from "../../db/postgres";
import { findActivityAggregateCount, findTotalCountForCategory } from "./helpers";

/**
 * Fetches the available years and the respective weeks that user has created. Not the actual week (like categories, note) but
 * literally the years and week numbers that have been created.
 * @param userid for which to fetch available dates.
 */
export const getAvailableDates = async (
    userid: string,
): Promise<i.DaoResponse<i.AvailableDate[]>> => {
    const client: PoolClient = await db.getClient();

    try {
        // Begin transaction
        await client.query("BEGIN");

        const getAvailableYearsQuery = "SELECT DISTINCT \"weekYear\" FROM week WHERE userid=$1 ORDER BY \"weekYear\" DESC;";
        const getAvailableWeeksOfYearQuery = "SELECT \"weekNr\" FROM week WHERE userid=$1 AND \"weekYear\"=$2 ORDER BY \"weekNr\" DESC;";

        const yearRes = await client.query(getAvailableYearsQuery, [userid]);

        const availableDates: i.AvailableDate[] = [];
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
            data: availableDates,
            success: true,
        };
    } catch (e: any) {
        await client.query("ROLLBACK");
        return { status: 400, error: e.message, data: [], success: false };
    } finally {
        client.release();
    }
};

/**
 * Fetches the amount of time spent on each category type and activity type
 * for a given week. In the return type, amount symbolizes the amount of 15
 * minute intervals.
 * @param userid of the user for which to find the total per week.
 * @param weekid of the week for which to find the total per week.
 */
export const getTotalPerWeek = async (
    userid: string,
    weekid: string,
): Promise<i.DaoResponse<i.TotalPerWeek>> => {
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

        const totalPerWeekCategoryTypesRows: QueryResult<i.TotalPerWeekCategoryType> = await client.query(getTotalPerWeekCategoryTypesQuery, [weekid, userid]);
        const totalPerWeekActivityTypesRows: QueryResult<i.TotalPerWeekActivityType> = await client.query(getTotalPerWeekActivityTypesQuery, [weekid, userid]);

        await client.query("COMMIT");

        const totalPerWeekCategoryTypes = totalPerWeekCategoryTypesRows.rows;
        const totalPerWeekActivityTypes = totalPerWeekActivityTypesRows.rows;

        // Creating empty activities
        for (let i = 0; i < totalPerWeekCategoryTypes.length; i++) {
            const categoryTotal:number = findTotalCountForCategory(totalPerWeekCategoryTypes, totalPerWeekCategoryTypes[i].categoryid);
            const activityTotal:number = findActivityAggregateCount(totalPerWeekActivityTypes, totalPerWeekCategoryTypes[i].categoryid);

            const emptyActivity: i.TotalPerWeekActivityType = {
                activityid: "Other", archived: false, categoryid: totalPerWeekCategoryTypes[i].categoryid, count: categoryTotal - activityTotal, long: "Other", short: "o", userid: totalPerWeekCategoryTypes[i].userid,
            };

            totalPerWeekActivityTypes.push(emptyActivity);
        }

        if (totalPerWeekCategoryTypesRows.rowCount === 0) {
            return {
                status: 404,
                error: "This week has no analytics.",
                data: {
                    categoryTypes: [],
                    activityTypes: [],
                },
                success: true,
            };
        }

        return {
            status: 200,
            error: "",
            data: {
                categoryTypes: totalPerWeekCategoryTypes,
                activityTypes: totalPerWeekActivityTypes,
            },
            success: true,
        };
    } catch (e: any) {
        await client.query("ROLLBACK");
        return {
                status: 400,
                error: e.message,
                data: {
                    categoryTypes: [],
                    activityTypes: [],
                },
                success: false,
            };
    } finally {
        client.release();
    }
};

/**
 * Fetches the amount of time spent on each category type and activity type
 * for a given week in each day. In the return type, amount symbolizes the amount of 15
 * minute intervals.
 * @param userid of the user for which to find the total  per day.
 * @param weekid of the week for which to find the total per day.
 */
export const getTotalPerDay = async (
    userid: string,
    weekid: string,
): Promise<i.DaoResponse<i.TotalPerDay[]>> => {
    const client: PoolClient = await db.getClient();
    const totalPerDay: i.TotalPerDay[] = [
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
            const totalPerDayCategories: QueryResult<i.TotalPerDayCategoryType> = await client.query(getTotalPerDayCategoriesQuery, [userid, userid, weekid, i]);
            const totalPerDayActivities: QueryResult<i.TotalPerDayActivityType> = await client.query(getTotalPerDayActivitiesQuery, [userid, weekid, i]);

            totalPerDay[i].categories = totalPerDayCategories.rows;
            totalPerDay[i].categories.forEach((category) => category.weekDay = i);
            totalPerDay[i].activities = totalPerDayActivities.rows;
            totalPerDay[i].activities.forEach((activity) => activity.weekDay = i);
        }

        await client.query("COMMIT");

        return {
            status: 200,
            error: "",
            data: totalPerDay,
            success: true,
        };
    } catch (e: any) {
        await client.query("ROLLBACK");
        return { status: 400, error: e.message, data: totalPerDay, success: false };
    } finally {
        client.release();
    }
};

export const getAvailableMonths = async (
    userid: string,
):Promise<i.DaoResponse<i.AvailableMonth[]>> => {
    try {
        const getAvailableMonthsQuery = "SELECT DISTINCT date_part('month', \"weekDayDate\") AS \"month\", date_part('year', \"weekDayDate\") AS \"year\", date_part('week', \"weekDayDate\") as \"weekNr\" \n" +
            "FROM category \n" +
            "WHERE userid=$1 " +
            "ORDER BY \"year\" DESC;";

        const availableMonths:QueryResult<i.AvailableMonth> = await db.query(getAvailableMonthsQuery, [userid]);

        return { status: 200, error: "", data: availableMonths.rows, success: true };
    } catch (e:any) {
        return { status: 400, error: e.message, data: [], success: false };
    }
};

export const getTotalPerMonth = async (
    userid: string,
    month: number,
    year: number,
):Promise<i.DaoResponse<i.TotalPerMonth>> => {
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

        const totalPerMonthCategoryRows:QueryResult<i.TotalPerMonthCategoryType> = await client.query(getTotalPerMonthCategoryQuery, [month, year, userid]);
        const totalPerMonthActivityRows:QueryResult<i.TotalPerMonthActivityType> = await client.query(getTotalPerMonthActivityQuery, [month, year, userid]);

        await client.query("COMMIT");

        const totalPerMonthCategory = totalPerMonthCategoryRows.rows;
        const totalPerMonthActivity = totalPerMonthActivityRows.rows;

        // Creating empty activities
        for (let i = 0; i < totalPerMonthCategory.length; i++) {
            const categoryTotal: number = findTotalCountForCategory(totalPerMonthCategory, totalPerMonthCategory[i].categoryid);
            const activityTotal: number = findActivityAggregateCount(totalPerMonthActivity, totalPerMonthCategory[i].categoryid);

            const emptyActivity: i.TotalPerWeekActivityType = {
                activityid: "Other",
                archived: false,
                categoryid: totalPerMonthCategory[i].categoryid,
                count: categoryTotal - activityTotal,
                long: "Other",
                short: "o",
                userid: totalPerMonthCategory[i].userid,
            };

            totalPerMonthActivity.push(emptyActivity);
        }

        if (totalPerMonthCategoryRows.rowCount === 0) {
            return {
                status: 404,
                error: "This week has no analytics.",
                data: {
                    categoryTypes: [],
                    activityTypes: [],
                },
                success: true,
            };
        }

        return { status: 200, error: "", data: { categoryTypes: totalPerMonthCategory, activityTypes: totalPerMonthActivity }, success: true };
    } catch (e: any) {
        await client.query("ROLLBACK");
        return { status: 400, error: e.message, data: {} as i.TotalPerMonth, success: false };
    } finally {
        client.release();
    }
};

export const getTotalPerDaySpecific = async (
    userid: string,
    day: number,
    weekNr: number,
    year: number,
):Promise<i.DaoResponse<i.TotalPerDaySpecific>> => {
    try {
        const getTotalPerDaySpecificQuery = "SELECT category.categoryid, COUNT(category.\"weekDay\")::int, \"categoryType\".name, \"categoryType\".color \n" +
            "FROM category, (SELECT * FROM category_type WHERE userid=$1) AS \"categoryType\" \n" +
            "WHERE category.userid=$2 \n" +
            "AND date_part('year', category.\"weekDayDate\")=$3\n" +
            "AND date_part('week', category.\"weekDayDate\")=$4 \n" +
            "AND category.\"weekDay\"=$5\n" +
            "AND \"categoryType\".categoryid=category.categoryid \n" +
            "GROUP BY category.categoryid, \"categoryType\".name, \"categoryType\".color";

        const totalPerDaySpecific: QueryResult<i.TotalPerDaySpecificCategoryType> = await db.query(getTotalPerDaySpecificQuery, [userid, userid, year, weekNr, day]);

        if (totalPerDaySpecific.rowCount === 0) {
            return {
                status: 404,
                error: `No categories have been added for day ${day} in week ${weekNr} in year ${year}`,
                data: {} as i.TotalPerDaySpecific,
                success: true,
            };
        }

        return {
            status: 200,
            error: "",
            data: {
                weekDay: day,
                categories: totalPerDaySpecific.rows,
            },
            success: true,
        };
    } catch (e: any) {
        return { status: 400, error: e.message, data: {} as i.TotalPerDaySpecific, success: false };
    }
};
