import { DateTime } from 'luxon';
import { v4 as uuid } from 'uuid';

export const generateCategories = (userid: string, weekYear: number, weekNr: number) => {
  const categoryData = [];

  for (let dayIndex:number = 0; dayIndex < 7; dayIndex++) {
      for (let pos:number = 1; pos < 97; pos++) {
          const weekDayDate: Date = DateTime.fromISO(`${weekYear}-W${String(weekNr).padStart(2, '0')}-${dayIndex + 1}`).toJSDate();
          categoryData.push({
            weekDay: dayIndex, categoryPosition: pos, userid, categoryid: null, activityid: null, weekDayDate,
          });
      }
  }

  return categoryData;
};

export const generateNotes = (userid: string, weekYear: number, weekNr: number) => {
  const notesData = [];

  for (let dayIndex:number = 0; dayIndex < 7; dayIndex++) {
      for (let pos:number = 1; pos < 97; pos++) {
          const weekDayDate: Date = DateTime.fromISO(`${weekYear}-W${String(weekNr).padStart(2, '0')}-${dayIndex + 1}`).toJSDate();

          const stackid = uuid();
          notesData.push({
            weekDay: dayIndex, notePosition: pos, stackid, userid, note: '', weekDayDate,
          });
      }
  }

  return notesData;
};
