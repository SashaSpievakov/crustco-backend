import * as crypto from 'crypto';

export const hashEmail = (email: string): string => {
  return crypto
    .createHmac('sha256', process.env.EMAIL_SECRET || '')
    .update(email.toLowerCase())
    .digest('hex');
};
