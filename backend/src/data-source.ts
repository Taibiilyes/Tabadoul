import * as dotenv from 'dotenv';
dotenv.config();

import { join } from 'path';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { KycDocument } from './entities/kyc-document.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { Room } from './entities/room.entity';

/**
 * مصدر بيانات مستقل يستعمله TypeORM CLI لتشغيل الـ migrations.
 * لا تُفعّل المزامنة التلقائية هنا أبدًا: المخطط يُدار حصريًا عبر ملفاتMigration.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  uuidExtension: 'pgcrypto',
  entities: [User, KycDocument, WalletTransaction, Room],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});

export default AppDataSource;
