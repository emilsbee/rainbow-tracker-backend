import * as i from 'types';
import * as s from 'superstruct';

export const CheckCredentialsModel: s.Describe<i.CheckCredentialsPayload> = s.object({
  email: s.string(),
  password: s.string(),
});
