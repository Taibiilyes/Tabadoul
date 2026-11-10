import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async send(to: string, subject: string, html: string, replyTo?: string) {
    try {
      await this.transporter.sendMail({
        from: `"تبادل" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        replyTo,
      });
    } catch (err) {
      // لا نُفشل الطلب الأصلي (مثل التسجيل) بسبب خطأ في إرسال بريد ثانوي،
      // لكن نسجّل الخطأ بوضوح لتتبعه
      this.logger.error(`فشل إرسال البريد إلى ${to}: ${err.message}`);
    }
  }

  async sendComplaintNotification(fromEmail: string, subject: string, message: string) {
    const supportEmail = process.env.APP_SUPPORT_EMAIL;
    if (!supportEmail) {
      this.logger.warn('APP_SUPPORT_EMAIL غير مضبوط في .env - لن تُرسَل الشكوى');
      return;
    }
    await this.send(
      supportEmail,
      `شكوى جديدة: ${subject}`,
      `<p><strong>من:</strong> ${fromEmail}</p><p>${message}</p>`,
      fromEmail, // الرد المباشر على هذا الإيميل يصل لصاحب الشكوى
    );
  }

  async sendWelcomeEmail(to: string) {
    await this.send(
      to,
      'مرحبًا بك في تبادل',
      `<p>تم إنشاء حسابك بنجاح. حصلت على 10 عملات ذهبية كمكافأة تسجيل.</p>
       <p>لأي استفسار أو شكوى، راسلنا على ${process.env.APP_SUPPORT_EMAIL}</p>`,
    );
  }
}
