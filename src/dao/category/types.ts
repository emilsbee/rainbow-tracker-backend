import * as i from 'types';
import { Category } from '@prisma/client';

export type GetCategoriesFromWeekPayload = {
  userid: string;
  weekid: string;
};
export type GetCategoriesFromWeek = (userid: string, weekid: string) => Promise<i.DaoResponse<Category[] | undefined>>;

export type UpdateWeekDayCategories = (
  weekid: string,
  userid: string,
  categories: Category[],
  day: number,
) => Promise<i.DaoResponse<Category[]>>;
