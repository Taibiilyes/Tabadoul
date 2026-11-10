import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WalletService } from './wallet.service';
import { PaymentProviderService } from './payment-provider.service';

@Controller('wallet')
export class WalletController {
  constructor(
    private walletService: WalletService,
    private paymentProvider: PaymentProviderService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('history')
  history(@CurrentUser() user: any) {
    return this.walletService.getHistory(user.userId);
  }

  // يُستدعى من التطبيق عند إنهاء أي مكالمة صوتية/مرئية بمدتها الفعلية بالثواني
  @UseGuards(JwtAuthGuard)
  @Post('charge-call')
  chargeCall(
    @CurrentUser() user: any,
    @Body() body: { durationSeconds: number },
  ) {
    return this.walletService.chargeForCall(user.userId, body.durationSeconds);
  }

  /**
   * إنشاء جلسة دفع لدى المزود المرخّص (Chargily/CIB/Stripe...).
   * المستخدم يُحوَّل إلى صفحة دفع المزود نفسه - لا تمر بيانات
   * البطاقة البنكية عبر خادمنا إطلاقًا.
   */
  @UseGuards(JwtAuthGuard)
  @Post('purchase/checkout')
  createCheckout(
    @CurrentUser() user: any,
    @Body() body: { packageCoins: number },
  ) {
    return this.paymentProvider.createCheckoutSession(
      user.userId,
      body.packageCoins,
    );
  }

  /**
   * Webhook مزود الدفع فقط (لا يُستدعى من الواجهة الأمامية أبدًا).
   * يجب التحقق من توقيع الطلب (signature) باستخدام PAYMENT_WEBHOOK_SECRET
   * قبل الوثوق بأي بيانات واردة هنا - هذا يمنع أي طرف من تزوير عمليات دفع وهمية.
   */
  @Post('purchase/webhook')
  async handleWebhook(
    @Headers('x-payment-signature') signature: string,
    @Body() payload: any,
  ) {
    const event = this.paymentProvider.verifyAndParseWebhook(
      signature,
      payload,
    );
    if (event.status === 'succeeded') {
      await this.walletService.creditPurchase(
        event.userId,
        event.coinsAmount,
        event.providerTransactionId,
      );
    }
    return { received: true };
  }
}
