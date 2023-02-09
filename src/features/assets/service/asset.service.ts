import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AssetDto } from '../dto/asset.dto';
import { OwnerDto } from '../dto/owner.dto';
import { PointDto } from '../dto/point.dto';
import { Asset } from '../schema/asset.schema';

@Injectable()
export class AssetService {
  constructor(@InjectModel(Asset.name) private assetModel: Model<any>) {}

  async createAssetPart(assets: Partial<AssetDto[]>) {
    await Promise.all(
      assets.map(async (asset: Asset) => {
        const data = await this.assetModel.create(asset);
        data.save();
      }),
    );
  }
  async getAll() {
    return this.assetModel.find();
  }

  async initAll() {
    return this.assetModel.deleteMany();
  }

  getAssetByCoord(point: PointDto) {
    return this.assetModel.findOne({ x: point.x, y: point.y });
  }

  async validateAssetByCoord(point: PointDto) {
    const asset = await this.getAssetByCoord(point);
    console.log('founded asset by coord: ', asset);
    if (!asset) {
      // throw new NotFoundException('asset not found');
      return null;
    }

    return asset;
  }

  async updateAssetOwnerByWallet(wallet: string, owner: OwnerDto) {
    await this.assetModel.updateMany(
      { owner: { wallet: wallet } },
      { owner: owner },
    );
  }

  async updateOwnerWallet(assetID: string, newWallet: string) {
    await this.assetModel.updateOne(
      { assetID: assetID },
      { 'owner.wallet': newWallet },
    );
  }

  async changeAssetImage(imageData: any, files: Object, url: string) {
    const imagePath = `${url}/upload/plot-images/${files[0].filename}`;
    let result = await this.assetModel.updateOne(
      { assetID: imageData.assetID },
      { image: imagePath },
    );
    let asset = await this.assetModel.findOne({ assetID: imageData.assetID });
    return asset;
  }
}
