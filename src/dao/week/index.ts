import * as i from 'types';
import { v4 as uuid } from 'uuid';

import { groupByDays, client, generateNotes, generateCategories } from 'services';
import { CreateWeekModel, GetFullWeekByIdModel, GetWeekIdModel } from 'models';

export const getFullWeekById: i.GetFullWeekById = async ({
    weekid,
    userid,
}) => {
    try {
        GetFullWeekByIdModel.parse({ userid, weekid });
    } catch (e: any) {
      return { status: 400, error: e.issues[0].message, data: undefined, success: true };
    };

    try {
        const week = await client.week.findFirst({
            where: {
                userid,
                weekid,
            },
            select: {
                weekYear: true,
                weekNr: true,
                weekid: true,
                userid: true,
                categories: {
                    where: {
                        weekid,
                    },
                },
                notes: {
                    where: {
                        weekid,
                    },
                },
            },
        });

        if (!week) {
            return { status: 404, error: 'No week found.', data: undefined, success: true };
        }

        return {
            status: 200,
            error: '',
            data: { ...week, notes: groupByDays(week.notes), categories: groupByDays(week.categories) },
            success: true,
        };
    } catch (e: any) {
        return { status: 400, error: e.message, data: undefined, success: false };
    };
};

export const getWeekId: i.GetWeekId = async ({
    weekNr,
    weekYear,
    userid,
}) => {
    try {
        GetWeekIdModel.parse({ userid, weekNr, weekYear });
    } catch (e: any) {
      return { status: 400, error: e.issues[0].message, data: undefined, success: true };
    };

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

        if (!weekId) return { status: 404, error: 'No week found.', success: true, data: undefined };

        return { status: 200, data: weekId.weekid, error: '', success: true };
    } catch (e: any) {
        return { status: 400, data: undefined, error: e.message, success: false };
    }
};

export const createFullWeek: i.CreateWeek = async ({
    weekNr,
    weekYear,
    userid,
}) => {
    try {
        CreateWeekModel.parse({ userid, weekNr, weekYear });
    } catch (e: any) {
      return { status: 400, error: e.issues[0].message, data: undefined, success: true };
    };

    const weekid = uuid();
    const categoryData = generateCategories(userid, weekYear, weekNr);
    const notesData = generateNotes(userid, weekYear, weekNr);

    try {
        const week = await client.week.create({
            data: {
                weekid,
                weekNr,
                weekYear,
                userid,
                notes: {
                    createMany: {
                        data: notesData,
                    },
                },
                categories: {
                    createMany: {
                        data: categoryData,
                    },
                },
            },
            select: {
                weekid: true,
                weekNr: true,
                weekYear: true,
                userid: true,
                categories: true,
                notes: true,
            },
        });

        return {
            error: '',
            status: 201,
            data: {
                ...week,
                categories: groupByDays(week.categories),
                notes: groupByDays(week.notes),
            },
            success: true,
        };
    } catch (e: any) {
        return { error: e.message, status: 400, data: undefined, success: false };
    }
};
