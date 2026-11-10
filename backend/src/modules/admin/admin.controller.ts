import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminService } from './admin.service';

// AdminGuard يتحقق من user.role === ADMIN على مستوى كل مسار هنا،
// بالإضافة لذلك يُنصَح بشدة بتفعيل 2FA على مستوى تسجيل دخول حساب المسير نفسه.
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('users/ban')
  banByIdentifier(@Body() body: { identifier: string; reason: string }) {
    return this.adminService.banUserByIdentifier(body.identifier, body.reason);
  }

  @Post('users/ban-by-ip')
  banByIp(@Body() body: { ip: string; reason: string }) {
    return this.adminService.banUsersByIp(body.ip, body.reason);
  }

  @Post('users/:id/unban')
  unban(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  @Post('rooms/:id/ban')
  banRoom(@Param('id') id: string) {
    return this.adminService.banRoom(id);
  }

  @Get('audit-log')
  auditLog(@Query('limit') limit?: string) {
    return this.adminService.getFullAuditLog(limit ? parseInt(limit, 10) : undefined);
  }

  @Get('users')
  listUsers(
    @Query('verificationStatus') verificationStatus?: string,
    @Query('isBanned') isBanned?: string,
  ) {
    return this.adminService.listUsers({
      verificationStatus,
      isBanned: isBanned === undefined ? undefined : isBanned === 'true',
    } as any);
  }
}
