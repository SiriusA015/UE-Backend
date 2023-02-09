import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AssetController } from './controller/asset.controller';
import { AssetService } from './service/asset.service';
import { UserAssetService } from './service/user-assets.service';
import { UserAssetController } from './controller/user-assets.controller';
import { Asset, AssetSchema } from './schema/asset.schema';
import { UserAssets, UserAssetsSchema } from './schema/user-assets.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Asset.name,
        schema: AssetSchema,
      },
      {
        name: UserAssets.name,
        schema: UserAssetsSchema,
      },
    ]),
    AuthModule,
  ],
  controllers: [AssetController, UserAssetController],
  providers: [AssetService, UserAssetService],
  exports: [AssetService],
})
export class AssetsModule {}
