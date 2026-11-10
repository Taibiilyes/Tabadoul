import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { User } from './entities/user.entity';
import { KycDocument } from './entities/kyc-document.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { Room } from './entities/room.entity';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { ChatModule } from './modules/chat/chat.module';
import { AdminModule } from './modules/admin/admin.module';
import { MailModule } from './modules/mail/mail.module';

const synchronize = process.env.DB_SYNCHRONIZE === 'true';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { ttl: 60000, limit: 100 }, // حد عام: 100 طلب/دقيقة لكل IP لحماية الـ API
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      uuidExtension: 'pgcrypto',
      entities: [User, KycDocument, WalletTransaction, Room],
      // المزامنة التلقائية مغلقة افتراضيًا. شغّل `npm run migration:run` قبل الإقلاع.
      synchronize,
      migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
      migrationsTableName: 'typeorm_migrations',
      migrationsRun: !synchronize && process.env.DB_MIGRATIONS_RUN === 'true',
      logging: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    UsersModule,
    DocumentsModule,
    WalletModule,
    RoomsModule,
    ChatModule,
    AdminModule,
    MailModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
