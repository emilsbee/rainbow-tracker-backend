import * as i from 'types';
import { Note } from '@prisma/client';
import { z } from 'zod';

import { UpdateNotesModel } from 'models';

export type UpdateNotes = (
  data: z.infer<typeof UpdateNotesModel>,
) => Promise<i.DaoResponse<Note[] | undefined>>;
