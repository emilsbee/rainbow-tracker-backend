import * as i from 'types';
import { PoolClient, QueryResult } from 'pg';
import * as s from 'superstruct';

import { client } from 'services';

import db from '../../db/postgres';
import { GetCategoriesFromWeekModel } from './models';

export const getCategoriesFromWeek: i.GetCategoriesFromWeek = async (userid, weekid) => {
  try {
    s.assert({ userid, weekid }, GetCategoriesFromWeekModel);
  } catch (e: any) {
    return { status: 400, error: e.message, data: undefined, success: true };
  };

  try {
    const categories = await client.category.findMany({
      where: {
          weekid,
          userid,
      },
      orderBy: {
          categoryPosition: 'asc',
      },
    });

    return { status: 200, error: '', success: true, data: categories };
  } catch (e: any) {
    return { status: 400, error: e.message, success: false, data: undefined };
  }
};

export const updateWeekDayCategories: i.UpdateWeekDayCategories = async (
    weekid,
    userid,
    categories,
    day,
) => {
    const client: PoolClient = await db.getClient();
    const updateWeekDayCategoriesQuery = 'UPDATE category SET categoryid=$1, activityid=$2 WHERE weekid=$3 AND "weekDay"=$4 AND "categoryPosition"=$5 AND userid=$6';

    try {
        // Begin transaction
        await client.query('BEGIN');

        for (let i = 0; i < categories.length; i++) {
            const updateWeekDayCategoriesQueryValues = [categories[i].categoryid, categories[i].activityid, weekid, day, categories[i].categoryPosition, userid];
            const res: QueryResult = await client.query(updateWeekDayCategoriesQuery, updateWeekDayCategoriesQueryValues);
            categories[i].userid = userid;

            if (res.rowCount < 1) {
                await client.query('COMMIT');
                return { status: 404, error: `Category not found for week ${weekid}.`, data: [], success: true };
            }
        }

        await client.query('COMMIT');
        return { status: 200, error: '', data: categories, success: true };
    } catch (e: any) {
        await client.query('ROLLBACK');
        return { status: 400, error: e.message, data: [], success: false };
    } finally {
        client.release();
    }
};
