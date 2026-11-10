import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { MailService } from './mail.service';
import { ComplaintDto } from './dto/complaint.dto';

@Controller('support')
export class SupportController {
  constructor(private mailService: MailService) {}

  /**
   * مسار عام (لا يتطلب تسجيل دخول) لتقديم شكوى أو اقتراح، كما طلب صراحة:
   * "يمكن تقديم شكوى بخصوص أي اعتراض أو اقتراح إلى عنوان البريد الإلكتروني الخاص بالتطبيق".
   * محدود بـ Throttle صارم لمنع إساءة الاستخدام (إغراق البريد).
   */
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 شكاوى بالساعة لكل IP
  @Post('complaint')
  async submitComplaint(@Body() dto: ComplaintDto) {
    await this.mailService.sendComplaintNotification(
      dto.fromEmail,
      dto.subject,
      dto.message,
    );
    return { message: 'تم استلام شكواك، سنتواصل معك عبر البريد الإلكتروني قريبًا' };
  }
}
