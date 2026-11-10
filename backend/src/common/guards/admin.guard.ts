import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '../../entities/user.entity';

/**
 * يُطبَّق حصريًا على مسارات لوحة التحكم (admin dashboard endpoints).
 * أي محاولة وصول من مستخدم دوره ليس ADMIN تُرفض فورًا.
 * يُنصَح بشدة بإضافة مصادقة ثنائية (2FA) إضافية فوق هذا الحارس
 * قبل الإنتاج الفعلي، نظرًا لحساسية الصلاحيات (توثيق حسابات، حظر، تعديل مالي).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('هذا المسار مخصّص للمسير فقط');
    }
    return true;
  }
}
