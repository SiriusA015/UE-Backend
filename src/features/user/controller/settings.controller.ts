import {
  BadRequestException,
  Body,
  Controller,
  Put,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { UpdateInfoDto } from '../dto/update-info.dto';
import { UpdateHandleDto } from '../dto/update-handle.dto';
import { UpdateEmailDto } from '../dto/update-email.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UpdateWalletDto } from '../dto/update-wallet.dto.';
import { User } from '../schema/user.schema';
import { UserService } from '../service/user.service';
import { OwnerDto } from 'src/features/assets/dto/owner.dto';
import { Asset } from 'src/features/assets/schema/asset.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(
    private userService: UserService,
    @InjectModel(Asset.name) private assetModel: Model<Asset>,
  ) {}

  @Put('info')
  async updateUserInfo(@CurrentUser() user: User, @Body() body: UpdateInfoDto) {
    const nameUser = await this.userService.getUserByName(body.username);
    if (nameUser && body.username !== user.username) {
      throw new BadRequestException('Username already exists');
    }
    user.username = body.username;

    user.save();
    return user;
  }

  @Put('password')
  async updatePassword(
    @CurrentUser() user: User,
    @Body() body: UpdatePasswordDto,
  ) {
    if (!(await user.validatePassword(body.currentPassword))) {
      throw new BadRequestException('Current password does not match');
    }

    if (body.password !== body.confirmPassword) {
      throw new BadRequestException('Passwords does not match');
    }

    if (await user.validatePassword(body.password)) {
      throw new BadRequestException('Do not use your current password');
    }

    user.password = body.password;
    user.save();
    return user;
  }

  @Put('handle')
  async updateHandle(@CurrentUser() user: User, @Body() body: UpdateHandleDto) {
    if (body.discordHandle !== undefined) {
      user.discordHandle = body.discordHandle;
    }
    if (body.twitterHandle !== undefined) {
      user.twitterHandle = body.twitterHandle;
    }
    if (body.adaHandle !== undefined) {
      user.adaHandle = body.adaHandle;
    }
    user.save();

    if (user.wAddress !== undefined && user.wAddress !== null) {
      let discord = body.discordHandle;
      let twitter = body.twitterHandle;
      let ada = body.adaHandle;
      const owner: OwnerDto = {
        email: user.email,
        wallet: user.wAddress,
        ...(discord && { discord }),
        ...(twitter && { twitter }),
        ...(ada && { ada }),
      };
      const data = await this.assetModel.updateMany(
        {
          'owner.wallet': user.wAddress,
        },
        { owner: owner },
      );

    }
    return user;
  }

  @Put('username')
  async updateUsername(
    @CurrentUser() user: User,
    @Body('username') username: string,
  ) {
    const usernameUser = await this.userService.getUserByName(username);

    if (usernameUser) {
      throw new BadRequestException('Username already exists');
    }

    user.username = username;

    return user.save();
  }

  @Put('email')
  async updateEmail(@CurrentUser() user: User, @Body() body: UpdateEmailDto) {
    const emailUser = await this.userService.getUserByEmail(body.email);

    if (emailUser) {
      throw new BadRequestException('Email already exists');
    }

    user.email = body.email;

    return user.save();
  }

  @Put('wallet')
  async setWalletAddress(
    @CurrentUser() user: User,
    @Body() body: UpdateWalletDto,
  ) {
    if (body.address !== undefined) {
      user.wAddress = body.address;
    }
    if (body.stakeAdr !== undefined) {
      user.stakeAdr = body.stakeAdr;
    }
    return user.save();
  }
}
