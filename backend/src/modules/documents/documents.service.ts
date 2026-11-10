import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  KycDocument,
  DocumentType,
  ReviewStatus,
} from '../../entities/kyc-document.entity';
import { User, VerificationStatus } from '../../entities/user.entity';
import { differenceInYears } from '../../common/utils/date.util';

const MIN_AGE = parseInt(process.env.MIN_AGE || '18', 10);

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(KycDocument)
    private docsRepo: Repository<KycDocument>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  /**
   * رفع وثيقة (بطاقة تعريف / جواز سفر / صورة حية).
   * storageKey يُفترض أنه نتج مسبقًا عن رفع الملف مباشرة إلى التخزين
   * السحابي المشفّر عبر رابط رفع موقّع (pre-signed upload URL)، وليس
   * عبر هذا الـ API مباشرة، لتفادي مرور بيانات حساسة عبر خادم التطبيق.
   */
  async uploadDocument(
    userId: string,
    type: DocumentType,
    storageKey: string,
  ) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    const doc = this.docsRepo.create({
      userId,
      type,
      storageKey,
      status: ReviewStatus.PENDING,
    });
    await this.docsRepo.save(doc);

    // بمجرد رفع وثيقة، تصبح حالة الحساب "بانتظار المراجعة" إذا لم تكن كذلك
    if (user.verificationStatus === VerificationStatus.UNVERIFIED) {
      user.verificationStatus = VerificationStatus.PENDING;
      await this.usersRepo.save(user);
    }

    return doc;
  }

  async getPendingReviews() {
    return this.docsRepo.find({
      where: { status: ReviewStatus.PENDING },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * الموافقة على وثيقة من طرف المسير فقط (يُفرض هذا عبر AdminGuard في الـ controller).
   * عند الموافقة على وثيقة الهوية (بطاقة/جواز)، يُفرض شرط السن 18+ فورًا.
   */
  async approveDocument(
    documentId: string,
    adminId: string,
    extractedFullName: string,
    extractedDateOfBirth: Date,
  ) {
    const doc = await this.docsRepo.findOne({
      where: { id: documentId },
      relations: ['user'],
    });
    if (!doc) throw new NotFoundException('الوثيقة غير موجودة');

    if (
      (doc.type === DocumentType.NATIONAL_ID ||
        doc.type === DocumentType.PASSPORT) &&
      extractedDateOfBirth
    ) {
      const age = differenceInYears(new Date(), extractedDateOfBirth);
      if (age < MIN_AGE) {
        doc.status = ReviewStatus.REJECTED;
        doc.rejectionReason = `العمر المستخرج من الوثيقة أقل من ${MIN_AGE} عامًا`;
        doc.reviewedByAdminId = adminId;
        doc.reviewedAt = new Date();
        await this.docsRepo.save(doc);
        throw new BadRequestException(
          `تم رفض الوثيقة: العمر أقل من ${MIN_AGE} عامًا`,
        );
      }
    }

    doc.status = ReviewStatus.APPROVED;
    doc.reviewedByAdminId = adminId;
    doc.reviewedAt = new Date();
    doc.extractedFullName = extractedFullName;
    doc.extractedDateOfBirth = extractedDateOfBirth;
    doc.rejectionReason = undefined; // امسح أي سبب رفض من محاولة سابقة فشلت
    await this.docsRepo.save(doc);

    // التحقق الكامل من الحساب يتطلب موافقة وثيقة هوية واحدة على الأقل
    // + صورة حية واحدة على الأقل معتمدتين معًا
    await this.maybeFullyVerifyUser(doc.userId);

    return doc;
  }

  async rejectDocument(documentId: string, adminId: string, reason: string) {
    const doc = await this.docsRepo.findOne({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('الوثيقة غير موجودة');

    doc.status = ReviewStatus.REJECTED;
    doc.rejectionReason = reason;
    doc.reviewedByAdminId = adminId;
    doc.reviewedAt = new Date();
    return this.docsRepo.save(doc);
  }

  private async maybeFullyVerifyUser(userId: string) {
    const approvedDocs = await this.docsRepo.find({
      where: { userId, status: ReviewStatus.APPROVED },
    });

    const hasIdentity = approvedDocs.some(
      (d) =>
        d.type === DocumentType.NATIONAL_ID ||
        d.type === DocumentType.PASSPORT,
    );
    const hasSelfie = approvedDocs.some(
      (d) => d.type === DocumentType.LIVE_SELFIE,
    );

    if (hasIdentity && hasSelfie) {
      const identityDoc = approvedDocs.find(
        (d) =>
          d.type === DocumentType.NATIONAL_ID ||
          d.type === DocumentType.PASSPORT,
      );
      await this.dataSource.transaction(async (manager) => {
        const user = await manager.findOne(User, { where: { id: userId } });
        if (!user || !identityDoc) return;
        user.verificationStatus = VerificationStatus.VERIFIED;
        if (identityDoc.extractedFullName) {
          const [first, ...rest] = identityDoc.extractedFullName.split(' ');
          user.firstName = first;
          user.lastName = rest.join(' ');
        }
        user.dateOfBirth = identityDoc.extractedDateOfBirth;
        await manager.save(user);
      });
    }
  }
}
