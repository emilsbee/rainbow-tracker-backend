import * as i from "types";
import { PoolClient, QueryResult } from "pg";
import { v4 as uuid } from "uuid";
import { DateTime } from "luxon";
import { note, category } from "@prisma/client";

import { groupByDays } from "services";
import { client } from "services";

import db from "../db/postgres";

export const getWeekByWeekid = async (
    weekid:string,
    userid:string,
):Promise<i.DaoResponse<any>> => {
    const notes = await client.note.findMany({
        where: {
            weekid,
            userid,
        },
        orderBy: {
            notePosition: "asc",
        },
    });

    const categories = await client.category.findMany({
        where: {
            weekid,
            userid,
        },
        orderBy: {
            categoryPosition: "asc",
        },
    });

    const week = await client.week.findFirst({
        where: {
            userid,
            weekid,
        },
    });

    return { status: 200, error: "", data: { notes: groupByDays(notes), categories: groupByDays(categories), week } };
};

/**
 * Fetches weekid by given weekNr and weekYear for a given user.
 * @param weekNr of the week.
 * @param weekYear of the week.
 * @param userid or null if no week found.
 */
export const getWeekId = async (
    weekNr:number,
    weekYear:number,
    userid:string,
):Promise<i.DaoResponse<string | null>> => {
    const weekidQueryValues = [userid, weekNr, weekYear];
    const getWeekidQuery = { name: "fetch-weekid", text: "SELECT weekid FROM week WHERE week.userid=$1 AND week.\"weekNr\"=$2 AND week.\"weekYear\"=$3", values: weekidQueryValues };

    try {
        const weekid: QueryResult<{ weekid: string }> = await db.query(getWeekidQuery);

        if (weekid.rowCount === 0) {
            return { data: null, error: `Week ${weekNr}, ${weekYear} was not found for user ${userid}.`, status: 404 };
        } else {
            return { data: weekid.rows[0].weekid, error: "", status: 200 };
        }
    } catch (e: any) {
        return { data: null, error: e.message, status: 400 };
    }
};

/**
 * Creates a full week (with categories and notes) with given week_number and week_year for a given user.
 * @param weekNr of the week to create.
 * @param weekYear of the week to create.
 * @param userid of the user for which to create the week.
 * @return {{status:number, category:FullWeek[]}}
 */
export const createWeek = async (
    weekNr:number,
    weekYear:number,
    userid:string,
):Promise<i.DaoResponse<i.FullWeek[]>> => {
    const client:PoolClient = await db.getClient();

    try {
        // Begin transaction
        await client.query("BEGIN");

        // Save week
        const createWeekQuery = "INSERT INTO week(weekid, userid, \"weekNr\", \"weekYear\") VALUES($1, $2, $3, $4);";
        const weekid = uuid();
        const values = [weekid, userid, weekNr, weekYear];
        await client.query(createWeekQuery, values);

        // Save weeks's categories and notes
        const categories: category[] = [];
        const notes: note[] = [];
        const createCategoryQuery:string = "INSERT INTO category(weekid, \"weekDay\", \"categoryPosition\", userid, \"weekDayDate\") VALUES($1, $2, $3, $4, $5);";
        const createNoteQuery:string = "INSERT INTO note(weekid, \"weekDay\", \"notePosition\", stackid, userid, note, \"weekDayDate\") VALUES($1, $2, $3, $4, $5, $6, $7);";

        for (let dayIndex:number = 0; dayIndex < 7; dayIndex++) {
            for (let pos:number = 1; pos < 97; pos++) {
                // Save category
                const weekDayDate: Date = DateTime.fromISO(`${weekYear}-W${String(weekNr).padStart(2, "0")}-${dayIndex + 1}`).toJSDate();

                const categoryValues = [weekid, dayIndex, pos,  userid, weekDayDate];
                categories.push({
                    weekid, weekDay: dayIndex, categoryPosition: pos, userid, categoryid: null, activityid: null, weekDayDate,
                });
                await client.query(createCategoryQuery, categoryValues);

                // Save note
                const stackid = uuid();
                const noteValues = [weekid, dayIndex, pos, stackid, userid, "", weekDayDate];
                notes.push({
                    weekid, weekDay: dayIndex, notePosition: pos, stackid, userid, note: "", weekDayDate,
                });
                await client.query(createNoteQuery, noteValues);
            }
        }

        // Commit transaction
        await client.query("COMMIT");

        return {
            status: 201,
            data: [{ weekid, userid: userid, weekNr: weekNr, weekYear: weekYear, notes: groupByDays(notes), categories: groupByDays(categories) }],
            error: "",
        };
    } catch (e: any) {
        await client.query("ROLLBACK");
        return { status: 400, data: [], error: e.message };
    } finally {
        client.release();
    }
};
