import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoomsService } from './rooms.service';

@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() body: { title: string }) {
    return this.roomsService.createRoom(user.userId, body.title);
  }

  @Get()
  list() {
    return this.roomsService.listActiveRooms();
  }

  @Post(':id/close')
  close(@CurrentUser() user: any, @Param('id') id: string) {
    return this.roomsService.closeRoom(id, user.userId);
  }
}
