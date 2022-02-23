import { z } from 'zod';

import { EmailModel, PasswordModel } from 'models';

export const CheckCredentialsModel = z.object({
  email: EmailModel,
  password: PasswordModel,
});
