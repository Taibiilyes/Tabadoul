import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';
import { RoomsService } from '../rooms/rooms.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(WalletTransaction)
    private txRepo: Repository<WalletTransaction>,
    private roomsService: RoomsService,
  ) {}

  /** حظر مستخدم بعنوان الهاتف أو الإيميل */
  async banUserByIdentifier(identifier: string, reason: string) {
    const user = await this.usersRepo.findOne({
      where: [{ phoneNumber: identifier }, { email: identifier }],
    });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    user.isBanned = true;
    user.banReason = reason;
    return this.usersRepo.save(user);
  }

  /** حظر كل الحسابات المرتبطة بعنوان IP معيّن */
  async banUsersByIp(ip: string, reason: string) {
    const users = await this.usersRepo
      .createQueryBuilder('user')
      .where(':ip = ANY(user.knownIps)', { ip })
      .getMany();

    for (const user of users) {
      user.isBanned = true;
      user.banReason = reason;
    }
    return this.usersRepo.save(users);
  }

  async unbanUser(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');
    user.isBanned = false;
    user.banReason = undefined;
    return this.usersRepo.save(user);
  }

  async banRoom(roomId: string) {
    return this.roomsService.banRoom(roomId);
  }

  /**
   * سجل كل الحركات المالية عبر كل المستخدمين (audit trail).
   * هذا هو المرجع الوحيد الموثوق لأي "تغيير أو تعديل" مالي في التطبيق،
   * ولا يمكن حذف أي سطر منه أبدًا (انظر ملاحظة wallet-transaction.entity).
   */
  async getFullAuditLog(limit = 200) {
    return this.txRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async listUsers(filter?: { verificationStatus?: string; isBanned?: boolean }) {
    return this.usersRepo.find({ where: filter as any });
  }
}
