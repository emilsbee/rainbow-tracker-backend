import { z } from 'zod';

import { UseridModel, WeekidModel, WeekNrModel, WeekYearModel } from 'models';

export const GetFullWeekByIdModel = z.object({
  userid: UseridModel,
  weekid: WeekidModel,
});

export const GetWeekIdModel = z.object({
  userid: UseridModel,
  weekNr: WeekNrModel,
  weekYear: WeekYearModel,
});

export const CreateWeekModel = z.object({
  userid: UseridModel,
  weekNr: WeekNrModel,
  weekYear: WeekYearModel,
});
