import { Controller, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Public } from 'src/decorators/public';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('getUsers')
  async getUsers(@Req() req) {
    return this.userService.getUsers();
  }
}
