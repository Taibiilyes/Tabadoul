import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PaymentProviderService } from './payment-provider.service';

@Module({
  controllers: [WalletController],
  providers: [WalletService, PaymentProviderService],
  exports: [WalletService],
})
export class WalletModule {}
