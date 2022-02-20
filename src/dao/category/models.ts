import * as i from 'types';
import * as s from 'superstruct';

export const GetCategoriesFromWeekModel: s.Describe<i.GetCategoriesFromWeekPayload> = s.object({
  userid: s.string(),
  weekid: s.string(),
});
