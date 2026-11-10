import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User, VerificationStatus } from '../../entities/user.entity';
import {
  WalletTransaction,
  TransactionType,
} from '../../entities/wallet-transaction.entity';

const CALL_COST_PER_60S = parseInt(
  process.env.CALL_COST_PER_60S || '25',
  10,
);
const ROOM_CREATION_COST = parseInt(
  process.env.ROOM_CREATION_COST || '100',
  10,
);
const COINS_PER_PACKAGE = 100;
const PRICE_USD_PER_PACKAGE = 3.99;

@Injectable()
export class WalletService {
  constructor(private dataSource: DataSource) {}

  /**
   * يُستدعى فقط من webhook بوابة الدفع بعد تأكيد الدفع الفعلي
   * (انظر PaymentWebhookController). لا يوجد أي مسار يسمح لأي طرف،
   * بما فيه المسير، بإضافة رصيد "شراء" يدويًا دون عملية دفع حقيقية موثّقة
   * من مزود الدفع - هذا يحمي سجل المحاسبة من التلاعب.
   */
  async creditPurchase(
    userId: string,
    coinsAmount: number,
    paymentProviderTransactionId: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user) throw new NotFoundException('المستخدم غير موجود');

      user.coinBalance += coinsAmount;
      await manager.save(user);

      const tx = manager.create(WalletTransaction, {
        userId,
        type: TransactionType.PURCHASE,
        amount: coinsAmount,
        balanceAfter: user.coinBalance,
        referenceId: paymentProviderTransactionId,
        note: `شراء ${coinsAmount} عملة (${(coinsAmount / COINS_PER_PACKAGE) * PRICE_USD_PER_PACKAGE} دولار تقريبًا) عبر بوابة الدفع`,
      });
      await manager.save(tx);
      return user;
    });
  }

  /** خصم تكلفة مكالمة كل 60 ثانية، مع احترام المكالمة المجانية الأولى بعد التوثيق */
  async chargeForCall(userId: string, durationSeconds: number) {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user) throw new NotFoundException('المستخدم غير موجود');

      if (user.verificationStatus !== VerificationStatus.VERIFIED) {
        throw new ForbiddenException(
          'يجب توثيق الحساب أولاً لإجراء المكالمات',
        );
      }

      // المكالمة المجانية الوحيدة بعد التوثيق
      if (!user.freeCallUsed) {
        user.freeCallUsed = true;
        await manager.save(user);
        return { charged: 0, freeCallUsed: true, balance: user.coinBalance };
      }

      const units = Math.ceil(durationSeconds / 60);
      const cost = units * CALL_COST_PER_60S;

      if (user.coinBalance < cost) {
        throw new BadRequestException('الرصيد غير كافٍ لإتمام المكالمة');
      }

      user.coinBalance -= cost;
      await manager.save(user);

      const tx = manager.create(WalletTransaction, {
        userId,
        type: TransactionType.CALL_COST,
        amount: -cost,
        balanceAfter: user.coinBalance,
        note: `تكلفة مكالمة (${durationSeconds} ثانية)`,
      });
      await manager.save(tx);

      return { charged: cost, freeCallUsed: false, balance: user.coinBalance };
    });
  }

  /** خصم تكلفة إنشاء غرفة - إجباري أن يكون الحساب موثّقًا */
  async chargeForRoomCreation(userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user) throw new NotFoundException('المستخدم غير موجود');

      if (user.verificationStatus !== VerificationStatus.VERIFIED) {
        throw new ForbiddenException(
          'يجب توثيق الحساب أولاً لإنشاء غرفة',
        );
      }

      if (user.coinBalance < ROOM_CREATION_COST) {
        throw new BadRequestException('الرصيد غير كافٍ لإنشاء غرفة');
      }

      user.coinBalance -= ROOM_CREATION_COST;
      await manager.save(user);

      const tx = manager.create(WalletTransaction, {
        userId,
        type: TransactionType.ROOM_CREATION,
        amount: -ROOM_CREATION_COST,
        balanceAfter: user.coinBalance,
        note: 'تكلفة إنشاء غرفة',
      });
      await manager.save(tx);

      return user.coinBalance;
    });
  }

  async getHistory(userId: string) {
    return this.dataSource.getRepository(WalletTransaction).find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
