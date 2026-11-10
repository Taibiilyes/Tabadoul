import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  @Get('me')
  async me(@CurrentUser() user: any) {
    const found = await this.usersRepo.findOne({ where: { id: user.userId } });
    if (!found) return null;
    const { passwordHash, ...rest } = found as any;
    return rest;
  }
}
