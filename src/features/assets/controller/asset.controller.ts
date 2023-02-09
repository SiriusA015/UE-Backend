import {
  Post,
  Get,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
} from '@nestjs/common';
import { Body, Controller } from '@nestjs/common';
import { AssetService } from '../service/asset.service';
import { Asset } from '../schema/asset.schema';
import { PointDto } from '../dto/point.dto';
import { ImageDto } from '../dto/image.dto';
import { diskStorage } from 'multer';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import Path = require('path');
import { v4 as uuidv4 } from 'uuid';
import { getURL } from 'src/shared/utils/get-url';

let url: string;
const storage = {
  storage: diskStorage({
    destination: 'public/upload/plot-images',
    filename: (req, file, cb) => {
      const filename: string = 'plot-' + uuidv4();
      const extension: string = Path.parse(file.originalname).ext;
      cb(null, `${filename}${extension}`);
      url = getURL(req);
    },
  }),
};

@Controller('assets')
export class AssetController {
  constructor(private assetService: AssetService) {}

  @Post('create')
  async saveAssetPart(@Body() assets: Asset[]) {
    const asset = await this.assetService.createAssetPart(assets);
    return asset;
  }

  @Get('all')
  async getAllAsset() {
    const allAssets = await this.assetService.getAll();
    return allAssets;
  }

  @Post('init')
  async initAllAsset() {
    const result = await this.assetService.initAll();
    return result;
  }

  @Post('coord')
  async getAssetByCoord(@Body() point: PointDto) {
    const result = await this.assetService.validateAssetByCoord(point);
    return result;
  }

  @Post('image')
  @UseInterceptors(FilesInterceptor('image', 1, storage))
  async changeAssetImage(@UploadedFiles() imageFile, @Body() imageInfo: any) {
    const result = await this.assetService.changeAssetImage(
      imageInfo,
      imageFile,
      url,
    );
    return result;
  }
}
