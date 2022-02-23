import { z } from 'zod';

import {
  DashboardPositionModel, UseridModel, WeekDayModel,
  WeekidModel, StackidModel, DateStringModel, NoteTextModel,
} from 'models';

const NoteModel = z.object({
  weekid: WeekidModel,
  weekDay: WeekDayModel,
  notePosition: DashboardPositionModel('notePosition'),
  stackid: StackidModel,
  userid: UseridModel,
  note: NoteTextModel,
  weekDayDate: DateStringModel('weekDayDate'),
});

export const UpdateNotesModel = z.object({
  userid: UseridModel,
  notes: NoteModel.array(),
});
