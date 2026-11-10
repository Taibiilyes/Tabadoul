import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';
import { DocumentType } from '../../entities/kyc-document.entity';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  // المستخدم يرفع وثيقته بعد الحصول على storageKey من رابط رفع موقّع مسبقًا
  @Post('upload')
  upload(
    @CurrentUser() user: any,
    @Body() body: { type: DocumentType; storageKey: string },
  ) {
    return this.documentsService.uploadDocument(
      user.userId,
      body.type,
      body.storageKey,
    );
  }

  // === المسارات التالية للمسير فقط ===

  @UseGuards(AdminGuard)
  @Get('pending')
  getPending() {
    return this.documentsService.getPendingReviews();
  }

  @UseGuards(AdminGuard)
  @Post(':id/approve')
  approve(
    @CurrentUser() admin: any,
    @Param('id') id: string,
    @Body() body: { extractedFullName: string; extractedDateOfBirth: string },
  ) {
    return this.documentsService.approveDocument(
      id,
      admin.userId,
      body.extractedFullName,
      new Date(body.extractedDateOfBirth),
    );
  }

  @UseGuards(AdminGuard)
  @Post(':id/reject')
  reject(
    @CurrentUser() admin: any,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.documentsService.rejectDocument(id, admin.userId, body.reason);
  }
}
