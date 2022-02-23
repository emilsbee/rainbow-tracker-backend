import * as i from 'types';
import { z } from 'zod';

import { CheckCredentialsModel } from 'models';


export type CheckCredentials = (
  data: z.infer<typeof CheckCredentialsModel>
) => Promise<i.DaoResponse<{ email: string, userid: string } | null | undefined>>;
