import { z } from 'zod';

import {
  DashboardPositionModel, DateStringModel, WeekDayModel,
  WeekidModel, UseridModel, generateStringError,
} from 'models';

export const CategoryModel = z.object({
  weekid: WeekidModel,
  weekDay: WeekDayModel,
  categoryPosition: DashboardPositionModel('categoryPosition'),
  userid: UseridModel,
  categoryid: z.string({
    invalid_type_error: generateStringError('categoryid'),
  }).nullable(),
  activityid: z.string({
    invalid_type_error: generateStringError('categoryid'),
  }).nullable(),
  weekDayDate: DateStringModel('weekDayDate'),
});

export const UpdateCategoriesModel = z.object({
  userid: UseridModel,
  categories: CategoryModel.array(),
});
