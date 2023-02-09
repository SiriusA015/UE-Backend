import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { User } from '../../user/schema/user.schema';
  import { Asset } from 'src/features/assets/schema/asset.schema';
import { UserAssets } from '../schema/user-assets.schema';
  
  @Injectable()
  export class UserAssetService {
    constructor(
      @InjectModel(UserAssets.name) private userAssetModel: Model<UserAssets>,
    ) {}
  
    async createUserAssets(assets: Partial<Asset[]>, user: User) {    
      const userAssets = await this.userAssetModel.create({
        assets: assets,
        owner: user._id,
      });
  
      return userAssets.save();
    }
  
    getUserAssets(user: User) {
      return this.userAssetModel.findOne({ owner: user._id });
    }
  
    async updateUserAssets(user: User, assets: Asset[]) {
      return this.userAssetModel.findOneAndUpdate(
        { owner: user._id },
        { assets: assets },
      );
    }
  
    async getAll() {
      return this.userAssetModel.find();
    }
  
    async getAssetOwner(assetID: string) {
      const data = await this.userAssetModel
        .findOne({ 'assets.assetID': assetID })
        .populate('owner');
      console.log('assetOwner: ', data);
      if (data) {
        return {
          wAddress: data.owner.wAddress || '',
          discordHandle: data.owner.discordHandle || '',
          twitterHandle: data.owner.twitterHandle || '',
          adaHandle: data.owner.adaHandle || '',
        };
      } else {
        return null;
      }
    }
  }
  