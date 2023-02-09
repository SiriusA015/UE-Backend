import { Post, Get, Param, Query } from '@nestjs/common';
import { Body, Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from 'src/features/user/schema/user.schema';
import { UserAssetService } from '../service/user-assets.service';
import { Asset } from 'src/features/assets/schema/asset.schema';

@Controller('user')
export class UserAssetController {
  constructor(private userAssetService: UserAssetService) {}

  @UseGuards(JwtAuthGuard)
  @Post('save-assets')
  async saveUserAsset(@CurrentUser() user: User, @Body() assets: Asset[]) {
    const userAssets = await this.userAssetService.getUserAssets(user);
    if (userAssets) {
      const asset = await this.userAssetService.updateUserAssets(user, assets);
      return asset;
    }
    const asset = await this.userAssetService.createUserAssets(assets, user);
    return asset;
  }

  @Get('get-assets')
  async getAllAsset() {
    const allAssets = await this.userAssetService.getAll();
    return allAssets;
  }
}
