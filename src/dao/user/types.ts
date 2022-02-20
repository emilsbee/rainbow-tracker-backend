import * as i from 'types';

export type CheckCredentialsPayload = {
  email: string;
  password: string;
}

export type CheckCredentials = (
  data: CheckCredentialsPayload
) => Promise<i.DaoResponse<{ email: string, userid: string } | null>>;
