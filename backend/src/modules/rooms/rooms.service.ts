import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomStatus } from '../../entities/room.entity';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room) private roomsRepo: Repository<Room>,
    private walletService: WalletService,
  ) {}

  async createRoom(ownerId: string, title: string) {
    // الخصم يتحقق داخليًا من أن الحساب موثّق ومن كفاية الرصيد
    await this.walletService.chargeForRoomCreation(ownerId);

    const room = this.roomsRepo.create({ ownerId, title });
    return this.roomsRepo.save(room);
  }

  async listActiveRooms() {
    return this.roomsRepo.find({
      where: { status: RoomStatus.ACTIVE },
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async closeRoom(roomId: string, requesterId: string) {
    const room = await this.roomsRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('الغرفة غير موجودة');
    if (room.ownerId !== requesterId) {
      throw new ForbiddenException('لا يمكنك إغلاق غرفة لا تملكها');
    }
    room.status = RoomStatus.CLOSED;
    room.closedAt = new Date();
    return this.roomsRepo.save(room);
  }

  // يُستخدم من طرف المسير فقط عبر AdminModule لإغلاق غرفة مخالفة
  async banRoom(roomId: string) {
    const room = await this.roomsRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('الغرفة غير موجودة');
    room.status = RoomStatus.BANNED;
    room.closedAt = new Date();
    return this.roomsRepo.save(room);
  }
}
