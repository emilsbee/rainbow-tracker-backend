import { DateTime } from 'luxon';

/**
 * Week can only be created 2 years ahead of current date. That's just to avoid the
 * ability to create infinite data since a week takes up quite a bit.
 */
export const canCreateNewWeek = (weekNr: number, weekYear: number) => {
  const maxDate = DateTime.now().plus({ years: 2 });
  const currentDate = DateTime.fromObject({ weekNumber: weekNr, weekYear: weekYear });

  if (currentDate.toMillis() >= maxDate.toMillis()) {
    return false;
  } else return true;
};
