import * as i from 'types';
import { z } from 'zod';
import { Category } from '@prisma/client';

import { UpdateCategoriesModel } from 'models';

export type UpdateCategories = (
  data: z.infer<typeof UpdateCategoriesModel>
) => Promise<i.DaoResponse<Category[] | undefined>>;
