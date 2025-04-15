/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { MigrationInterface } from 'mongo-migrate-ts';
import { Db } from 'mongodb';

import { UserDocument } from 'src/users/schemas/user.schema';

export class AddDefaultsToUsers implements MigrationInterface {
  async up(db: Db): Promise<void> {
    const users = await db.collection('users').find({}).toArray();

    for (const user of users) {
      const update: Partial<UserDocument> = {};
      if (user.verificationCodeExpiresAt === undefined) update.verificationCodeExpiresAt = null;
      if (user.provider === undefined) update.provider = null;
      if (user.twoFactorMethod === undefined) update.twoFactorMethod = null;
      if (user.totpSecret === undefined) update.totpSecret = null;
      if (user.totpEnabled === undefined) update.totpEnabled = null;
      if (user.totp2FAStarted === undefined) update.totp2FAStarted = null;
      if (user.photo === undefined) update.photo = null;

      if (Object.keys(update).length > 0) {
        await db.collection('users').updateOne({ _id: user._id }, { $set: update });
      }
    }
  }

  async down(): Promise<void> {
    // No-op or revert if needed
  }
}
