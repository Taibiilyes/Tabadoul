import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, WalletTransaction]),
    RoomsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
