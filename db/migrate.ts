import 'dotenv/config';

import { mongoMigrateCli } from 'mongo-migrate-ts';

mongoMigrateCli({
  migrationsDir: __dirname + '/migrations',
  useEnv: true,
  environment: {
    uriVar: 'DB_CONNECTION_STRING',
  },
});
