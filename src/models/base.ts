import { z } from 'zod';

import { generateRequiredError, generateStringError, generateNumberError } from './utils';

export const UseridModel = z.string({
  required_error: generateRequiredError('userid'),
  invalid_type_error: generateStringError('userid'),
});

export const EmailModel = z.string({
  required_error: generateRequiredError('email'),
  invalid_type_error: generateStringError('email'),
});

export const PasswordModel = z.string({
  required_error: generateRequiredError('password'),
  invalid_type_error: generateStringError('password'),
});

export const WeekNrModel = z
  .number({
    required_error: generateRequiredError('weekNr'),
    invalid_type_error: generateNumberError('weekNr'),
  })
  .min(1, { message: 'weekNr can min be 1' })
  .max(53, { message: 'weekNr can nax be 53' });

export const WeekYearModel = z
  .number({
    required_error: generateRequiredError('weekYear'),
    invalid_type_error: generateNumberError('weekYear'),
  })
  .min(0, { message: 'weekYear must be a positive integer' });

export const NoteTextModel = z
  .string({
    invalid_type_error: generateStringError('note'),
  })
  .nullable();

export const StackidModel = z.string({
  required_error: generateRequiredError('stackid'),
  invalid_type_error: generateStringError('stackid'),
});

export const WeekidModel = z.string({
  required_error: generateRequiredError('weekid'),
  invalid_type_error: generateStringError('weekid'),
});

export const WeekDayModel = z
  .number({ required_error: generateRequiredError('weekDay'), invalid_type_error: generateNumberError('weekDay') })
  .min(0, { message: 'weekDay can min be 0' })
  .max(6, { message: 'weekDay can max be 6' });

export const DashboardPositionModel = (fieldName: string) => z
  .number({ required_error: generateRequiredError(fieldName), invalid_type_error: generateNumberError(fieldName) })
  .min(1, { message: `${fieldName} can min be 1` })
  .max(96, { message: `${fieldName} can max be 96` });

export const DateStringModel = (fieldName: string, optional = false) => z.preprocess(
  (input) => {
    if (input instanceof Date) return input;
    if (typeof input == 'string') return new Date(input);
    return input;
  },
  optional ? (
    z.date({
        required_error: generateRequiredError(fieldName),
        invalid_type_error: `${fieldName} must be a valid javascript date string`,
    })
    .nullable()
  ) : (
    z.date({
      required_error: generateRequiredError(fieldName),
      invalid_type_error: `${fieldName} must be a valid javascript date string`,
    })
  ),
);
