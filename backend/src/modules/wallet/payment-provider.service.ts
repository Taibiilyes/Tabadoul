import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

const COINS_PER_PACKAGE = 100;
const PRICE_USD_PER_PACKAGE = 3.99;

/**
 * هذه طبقة تجريد (abstraction) فقط. يجب استبدال منطق التحقق والإنشاء
 * هنا بتكامل حقيقي مع مزود دفع مرخّص رسميًا في الجزائر أو دوليًا
 * (مثل Chargily Pay أو CIB أو Stripe)، بحسب استشارة قانونية/مالية مسبقة.
 *
 * لماذا هذا التصميم بدل "محفظة شخصية" تُحوَّل إليها الأموال مباشرة؟
 * لأن تحصيل أموال حقيقية من عموم المستخدمين عبر تحويل مباشر إلى محفظة
 * شخصية، مع سياسة "بدون استرداد نهائيًا"، يقع عادة ضمن تعريف "تحويل
 * الأموال" (money transmission) وقد يستوجب ترخيصًا رسميًا، كما أن
 * سياسة منع الاسترداد المطلقة قد تخالف قوانين حماية المستهلك.
 * استخدام مزود دفع مرخّص يحوّل عبء الامتثال (compliance) والتعامل مع
 * النزاعات (chargebacks/استرداد) إلى جهة مرخّصة لذلك، ويحميك قانونيًا.
 */
@Injectable()
export class PaymentProviderService {
  createCheckoutSession(userId: string, packageCoins: number) {
    if (packageCoins % COINS_PER_PACKAGE !== 0) {
      throw new BadRequestException(
        `يجب أن تكون كمية العملات من مضاعفات ${COINS_PER_PACKAGE}`,
      );
    }
    const packages = packageCoins / COINS_PER_PACKAGE;
    const amountUsd = +(packages * PRICE_USD_PER_PACKAGE).toFixed(2);

    // TODO: استبدل هذا باستدعاء API الحقيقي لمزود الدفع المختار
    // مثال (Chargily): POST https://pay.chargily.net/api/v2/checkouts
    return {
      message: 'استبدل هذه الدالة بتكامل حقيقي مع مزود دفع مرخّص',
      userId,
      packageCoins,
      amountUsd,
      checkoutUrl: null,
    };
  }

  verifyAndParseWebhook(signature: string, payload: any) {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;
    const expected = crypto
      .createHmac('sha256', secret || '')
      .update(JSON.stringify(payload))
      .digest('hex');

    if (!signature || signature !== expected) {
      throw new BadRequestException('توقيع Webhook غير صالح');
    }

    // شكل البيانات يعتمد على مزود الدفع الفعلي المُختار - هذا مثال توضيحي فقط
    return {
      status: payload.status as 'succeeded' | 'failed',
      userId: payload.metadata?.userId as string,
      coinsAmount: payload.metadata?.coinsAmount as number,
      providerTransactionId: payload.id as string,
    };
  }
}
