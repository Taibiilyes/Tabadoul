import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum DocumentType {
  NATIONAL_ID = 'national_id', // بطاقة التعريف الوطنية
  PASSPORT = 'passport', // جواز السفر
  LIVE_SELFIE = 'live_selfie', // الصورة الحية عبر كاميرا الهاتف/الكومبيوتر
}

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * ملاحظة مهمة: هذا الجدول يخزّن روابط لملفات مشفّرة في التخزين السحابي
 * (مثل S3 مع تشفير SSE-KMS) وليس الملفات نفسها. الوصول لهذه الملفات
 * يجب أن يكون محصورًا حصريًا بحساب المسير (admin) عبر روابط موقّعة
 * (signed URLs) قصيرة الصلاحية، ويُسجَّل كل وصول في audit log منفصل.
 *
 * التوثيق يتم يدويًا من طرف المسير (لا يوجد تحقق آلي بالذكاء الاصطناعي
 * في هذا التصميم) بحسب طلب المستخدم صراحة.
 */
@Entity('kyc_documents')
export class KycDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  // مسار الملف المشفّر في التخزين السحابي (ليس رابطًا عامًا)
  @Column()
  storageKey: string;

  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.PENDING })
  status: ReviewStatus;

  // الاسم/اللقب/تاريخ الميلاد المستخرجة يدويًا من الوثيقة من طرف المسير
  @Column({ nullable: true })
  extractedFullName: string;

  @Column({ type: 'date', nullable: true })
  extractedDateOfBirth: Date;

  @Column({ nullable: true })
  reviewedByAdminId: string;

  @Column({ nullable: true })
  rejectionReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;
}
