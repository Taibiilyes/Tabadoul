import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { SupportController } from './support.controller';

@Module({
  controllers: [SupportController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
