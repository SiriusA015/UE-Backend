import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { User } from '../../user/schema/user.schema';
import { UserService } from '../../user/service/user.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthService } from '../service/auth.service';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Dictionary } from 'code-config';
import { Response } from 'express';
import { authConfig } from '../config/auth.config';
import { stringify } from 'qs';
import { SubscriptionService } from '../../user/service/subscription.service';
import { AuthNotRequired } from '../decorators/auth-not-required.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private subscriptionService: SubscriptionService
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(
      await this.authService.validate(body.email, body.password),
    );
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.loginWithRefreshToken(refreshToken);
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    console.log("register body:", body)
    if (await this.userService.getUserByName(body.username)) {
      throw new BadRequestException('Username already exists');
    }

    if (await this.userService.getUserByEmail(body.email)) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.userService.create(body);

    return this.authService.login(user);
  }

  @Post('apple-callback')
  appleCallback(@Body() body: Dictionary, @Res() res: Response) {
    const uri = `intent://callback?${stringify(body)}#Intent;package=${
      authConfig.apple.android.packageId
    };scheme=signinwithapple;end`;

    return res.redirect(uri);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('logout-from-all-devices')
  async logoutFromAllDevices(@CurrentUser() user: User) {
    user.generateSessionToken();

    await user.save();

    await this.subscriptionService.deleteAll(user);

    return this.authService.login(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User) {
    return this.userService.filterUser(user, ['email']);
  }
}
