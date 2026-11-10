import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum TransactionType {
  SIGNUP_BONUS = 'signup_bonus', // 10 عملات عند التسجيل
  PURCHASE = 'purchase', // شراء عملات عبر بوابة دفع مرخّصة
  CALL_COST = 'call_cost', // خصم مقابل مكالمة
  ROOM_CREATION = 'room_creation', // خصم إنشاء غرفة (100 عملة)
  ADMIN_ADJUSTMENT = 'admin_adjustment', // تعديل يدوي من المسير (يُسجَّل دومًا مع سبب)
}

/**
 * سجل محاسبي (ledger) غير قابل للتعديل: كل حركة رصيد هي سطر جديد،
 * لا تُحذف ولا تُعدَّل الأسطر القديمة أبدًا. هذا يسمح بمطابقة الأرصدة
 * والتدقيق المالي لاحقًا، وهو أساسي لأي نظام يتعامل بأموال حقيقية.
 *
 * ملاحظة: عمليات الشراء (PURCHASE) لا تُنشأ يدويًا، بل حصريًا عبر
 * webhook من بوابة الدفع المرخّصة بعد تأكيد الدفع (انظر PaymentModule).
 * لا يوجد في هذا التصميم أي "محفظة شخصية" يديرها فرد لتحصيل الأموال مباشرة.
 */
@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  // موجب = إضافة رصيد، سالب = خصم
  @Column({ type: 'int' })
  amount: number;

  // الرصيد بعد هذه الحركة (لتسهيل التدقيق دون إعادة حساب كل السجل)
  @Column({ type: 'int' })
  balanceAfter: number;

  // معرّف مرجعي خارجي (مثلاً معرّف عملية الدفع من بوابة الدفع، أو معرّف المكالمة)
  @Column({ nullable: true })
  referenceId: string;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;
}
