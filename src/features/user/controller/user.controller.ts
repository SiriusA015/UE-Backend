import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from '../service/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':username')
  async getUser(@Param('username') username: string) {
    return this.userService.filterUser(
      await this.userService.validateUserByName(username),
    );
  }

  @Get('id/:id')
  async getUserById(@Param('id') id: string) {      
    return this.userService.validateUserById(id);
  } 
}
