import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { KycDocument } from './kyc-document.entity';
import { WalletTransaction } from './wallet-transaction.entity';
import { Room } from './room.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified', // لم يقدم وثائق بعد
  PENDING = 'pending', // بانتظار مراجعة المسير
  VERIFIED = 'verified', // تم التوثيق من طرف المسير
  REJECTED = 'rejected', // تم الرفض
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin', // المسير فقط
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // التسجيل يتم بالهاتف أو الإيميل (أحدهما إجباري على الأقل)
  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  // تُشتق من تاريخ الميلاد في وثيقة الهوية بعد التوثيق، إجبارية >= 18
  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.UNVERIFIED,
  })
  verificationStatus: VerificationStatus;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  // رصيد العملات الداخلية (مصدر الحقيقة الفعلي هو جدول wallet_transactions،
  // هذا الحقل مجرد تخزين مؤقت (cache) يُحدَّث ضمن نفس المعاملة (transaction) دومًا)
  @Column({ type: 'int', default: 0 })
  coinBalance: number;

  // هل استُهلكت المكالمة المجانية الوحيدة بعد التوثيق
  @Column({ default: false })
  freeCallUsed: boolean;

  // حظر بعنوان الهاتف/الإيميل (من لوحة تحكم المسير)
  @Column({ default: false })
  isBanned: boolean;

  @Column({ nullable: true, type: 'varchar' })
  banReason?: string;

  // آخر عناوين IP معروفة لهذا المستخدم (لأغراض الحظر من طرف المسير)
  @Column('simple-array', { nullable: true })
  knownIps: string[];

  @OneToMany(() => KycDocument, (doc) => doc.user)
  documents: KycDocument[];

  @OneToMany(() => WalletTransaction, (tx) => tx.user)
  transactions: WalletTransaction[];

  @OneToMany(() => Room, (room) => room.owner)
  ownedRooms: Room[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
