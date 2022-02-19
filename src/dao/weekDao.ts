import * as i from "types";
import { v4 as uuid } from "uuid";

import { groupByDays, client, generateNotes, generateCategories } from "services";

export const getWeekByWeekid = async (
    weekid:string,
    userid:string,
):Promise<i.DaoResponse<i.FullWeek | undefined>> => {
    try {
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

        if (!week) {
            return { status: 404, error: "No week found.", data: undefined, success: true };
        }

        return {
            status: 200,
            error: "",
            data: {
                notes: groupByDays(notes),
                categories: groupByDays(categories),
                ...week,
            },
            success: true,
        };
    } catch (e: any) {
        return { status: 400, error: e.message, data: undefined, success: false };
    };
};

export const getWeekId = async (
    weekNr:number,
    weekYear:number,
    userid:string,
):Promise<i.DaoResponse<string | undefined | null>> => {
    try {
        const weekId = await client.week.findFirst({
            select: {
                weekid: true,
            },
            where: {
                userid,
                weekNr,
                weekYear,
            },
        });

        if (!weekId) return { status: 404, error: "No week found.", success: true, data: undefined };

        return { status: 200, data: weekId.weekid, error: "", success: true };
    } catch (e: any) {
        return { status: 400, data: undefined, error: e.message, success: false };
    }
};

export const createWeek = async (
    weekNr:number,
    weekYear:number,
    userid:string,
):Promise<i.DaoResponse<i.FullWeek | undefined>> => {
    const weekid = uuid();

    try {
        const week = await client.week.create({
            data: {
                weekid,
                weekNr,
                weekYear,
                userid,
            },
        });

        const categoryData = generateCategories(userid, weekid, weekYear, weekNr);
        const notesData = generateNotes(userid, weekid, weekYear, weekNr);

        await client.category.createMany({
            data: categoryData,
        });


        await client.note.createMany({
            data: notesData,
        });

        return {
            error: "",
            status: 201,
            data: {
                ...week,
                categories: groupByDays(categoryData),
                notes: groupByDays(notesData),
            },
            success: true,
        };
    } catch (e: any) {
        return { error: e.message, status: 400, data: undefined, success: false };
    }
};
