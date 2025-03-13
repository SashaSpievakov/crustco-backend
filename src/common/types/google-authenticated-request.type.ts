import { Request } from 'express';

import { ProviderUser } from './provider-user.type';

export interface GoogleAuthenticatedRequest extends Request {
  user: ProviderUser;
}
