import * as i from 'types';
import { z } from 'zod';

import { CreateWeekModel, GetFullWeekByIdModel, GetWeekIdModel } from 'models';

export type GetFullWeekById = (
  data: z.infer<typeof GetFullWeekByIdModel>
) => Promise<i.DaoResponse<i.FullWeek | undefined>>;


export type GetWeekId = (
  data: z.infer<typeof GetWeekIdModel>
) => Promise<i.DaoResponse<string | undefined | null>>;

export type CreateWeek = (
  data: z.infer<typeof CreateWeekModel>
) => Promise<i.DaoResponse<i.FullWeek | undefined>>;
