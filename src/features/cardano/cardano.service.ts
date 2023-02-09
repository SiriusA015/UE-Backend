import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Cron, Interval, Timeout, CronExpression } from '@nestjs/schedule';
import { environments } from '../../environments/environments';
import {
  ASSETS_POLICY_ID,
  CUSTOM_POLICY_ID,
  ALL_ASSETS_READ_COUNT,
} from 'src/shared/constants/blockfrost';
import { AssetDto, AssetListDto } from '../assets/dto/asset.dto';
import { AssetService } from '../assets/service/asset.service';
import fetch from 'node-fetch';
import { UserService } from '../user/service/user.service';
import { User } from '../user/schema/user.schema';

@Injectable()
export class CardanoService implements OnModuleInit {
  constructor(
    private assetService: AssetService,
    private userService: UserService,
  ) { }

  private readonly logger = new Logger(CardanoService.name);
  private allAssetsNum = 0;
  private accessData = {
    userHasDiamondPass: false,
    userHasSapphirePass: false,
    userHasEmeraldPass: false,
    userHasRubyPass: false,
  };

  onModuleInit() {
    console.log(`Initialization...`);
    // this.catchAllAssets();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleCron() {
    this.logger.debug('start update Owner cron job --- >');
    this.updateOwners();
  }

  async catchAllAssets() {
    let final: boolean = false;
    let pageNum: number = 1;
    let assetListArray: AssetListDto[] = [];

    while (!final) {
      let assets: any = await this.findAllAssets(pageNum);
      if (!assets.length){
        this.logger.debug('server error!', assets);
        final = true;
      }
      console.log('all tested assets count is ', assets.length * pageNum);
      assetListArray = assetListArray.concat(assets);
      pageNum++;

      if (assets.length < ALL_ASSETS_READ_COUNT) {
        this.logger.debug('The process to fetch assets has done!');
        final = true;
        const filteredArray = await this.makeFilteredAssets(assetListArray, 1);
        this.logger.debug('The process to filteredArray has done!', filteredArray.length);
        await this.assetService.initAll();
        await this.assetService.createAssetPart(filteredArray);
        this.allAssetsNum = 0;
      }
    }
  }

  async callApi(networkId: number, endPoint: string) {
    try {
      const request: string =
        networkId === 1
          ? environments.blockfrostUrl + endPoint
          : environments.blockfrostUrl + endPoint;
      const response = await fetch(request, {
        //@ts-ignore
        headers: {
          'Content-Type': 'application/json',
          project_id:
            networkId === 1
              ? environments.blockfrostKey
              : environments.blockfrostKey,
        },
        method: 'GET',
      });

      let data = await response.json();
      if (data.error && data.status_code === 402) {
        console.log('Usage is over limit.')
      }
      return data;
    } catch (error) { }
  }

  async findAllAssets(pageNumber: number) {
    try {
      const endPoint = `assets/policy/${ASSETS_POLICY_ID}?count=${ALL_ASSETS_READ_COUNT}&page=${pageNumber}`;
      const result = await this.callApi(1, endPoint);
      return result;
    } catch (error){
      this.logger.debug('server error!', error);
    }
   
  }

  async getWalletWithAsset(assetId: string) {
    try {
      const endPoint = `assets/${assetId}/addresses`;
      const result = await this.callApi(1, endPoint);
      console.log('address====>', result);
      if (result !== null && result.length > 0) {
        return result[0].address;
      }
    } catch (error) {
      this.logger.debug('server error!', error);
    }
  }

  async findSpecificAsset(networkId: number, assetId: string) {
    const endPoint = `assets/${assetId}`;
    const result = await this.callApi(networkId, endPoint);
    return result;
  }

  async makeFilteredAssets(assets: any, networkId: any) {
    const FiteredAssets: any = [];
    for (let i = 0; i < assets.length; i++) {
      const assetHash = assets[i].unit ? assets[i].unit : assets[i].asset;

      console.log('The process to filteredArray!', i, ':::', assetHash);

      const detailedAsset = await this.findSpecificAsset(networkId, assetHash);
      
      if (detailedAsset != undefined && detailedAsset != null) {

        const metadata = detailedAsset.onchain_metadata;
        if (metadata === undefined || metadata === null) {
          console.log('wrong asset type metadata: ', detailedAsset);
        } else {
          const IAsset: AssetDto = {
            name: metadata.name || '',
            assetID: assetHash,
            image: 'https://ipfs.io/ipfs/' + metadata.image?.slice(7),
            info: metadata['---INFO---'][0] || '',
            link: metadata['---LINK---'] || '',
            season: metadata['---SEASON---'] || '',
            type: metadata['---TYPE---'] || '',
            x: metadata['---X---'] || '',
            y: metadata['---Y---'] || '',
            estateId: metadata['---EstateId'] || '',
            owner: {
              wallet: undefined,
            }
          };
          FiteredAssets.push(IAsset);
          this.allAssetsNum++;
        } 
      } else {
        console.log('wrong asset type detailedAsset: ', detailedAsset);
      }
    }
    return FiteredAssets;
  }

  confirmPolicyId(policyID: string) {
    return policyID === ASSETS_POLICY_ID;
  }

  async findAssetsInWallet(
    networkId: number,
    stakeAddress: string,
    pageNumber: number,
  ) {
    const endPoint = `accounts/${stakeAddress}/addresses/assets?count=${ALL_ASSETS_READ_COUNT}&page=${pageNumber}`;
    const result = await this.callApi(networkId, endPoint);
    return result;
  }

  async makeAccessAssets(assets: any) {
    for (let i = 0; i < assets.length; i++) {
      const assetHash = assets[i].unit ? assets[i].unit : assets[i].asset;
      if (assetHash.indexOf(CUSTOM_POLICY_ID) >= 0) {
        const detailedAsset = await this.findSpecificAsset(1, assetHash);
        console.log('desirable asset: ', detailedAsset);

        const metadata = detailedAsset.onchain_metadata;
        if (metadata['Power Level'] === '10') {
          this.accessData.userHasDiamondPass = true;
        } else if (metadata['Power Level'] === '8') {
          this.accessData.userHasSapphirePass = true;
        } else if (metadata['Power Level'] === '6') {
          this.accessData.userHasEmeraldPass = true;
        } else if (metadata['Power Level'] === '4') {
          this.accessData.userHasRubyPass = true;
        }
      }
    }
  }

  initAccessData() {
    this.accessData = {
      userHasDiamondPass: false,
      userHasSapphirePass: false,
      userHasEmeraldPass: false,
      userHasRubyPass: false,
    };
  }
  async catchAssetsfromWallet(stakeAddress: string, policyId: string) {
    let final: boolean = false;
    let pageNum: number = 1;
    let assetArray: AssetDto[] = [];

    while (!final) {
      let assets: any = await this.findAssetsInWallet(1, stakeAddress, pageNum);
      console.log("num ------: ", pageNum, 'assets length: ', assets.length);
      pageNum++;
      if (policyId === ASSETS_POLICY_ID) {
      } else if (policyId === CUSTOM_POLICY_ID) {
        await this.makeAccessAssets(assets);
      }
      if (assets.length < ALL_ASSETS_READ_COUNT || assets.length === undefined) {
        final = true;
        if (policyId === ASSETS_POLICY_ID) {
          return assetArray.length > 0 ? assetArray : null;
        }
        if (policyId === CUSTOM_POLICY_ID) {
          return this.accessData;
        }
      }
    }
  }

  getHasAccessState(accessData: any) {
    var startDate1 = new Date('2022-12-21');
    var startDate2 = new Date('2022-01-04');
    var startDate3 = new Date('2022-01-18');
    var startDate4 = new Date('2022-02-01');
    var today = new Date();
    if (
      today.getTime() > startDate1.getTime() &&
      accessData.userHasDiamondPass
    ) {
      console.log('1');
      return true;
    } else if (
      today.getTime() > startDate2.getTime() &&
      accessData.userHasSapphirePass
    ) {
      console.log('2');
      return true;
    } else if (
      today.getTime() > startDate3.getTime() &&
      accessData.userHasEmeraldPass
    ) {
      console.log('3');
      return true;
    } else if (
      today.getTime() > startDate4.getTime() &&
      accessData.userHasRubyPass
    ) {
      console.log('4');
      return true;
    } else {
      console.log('0');
      return false;
    }
  }

  validateWalletState(user: User) {
    if (user.stakeAdr === undefined) {
      throw new NotFoundException('Wallet not be connected');
    }
    else {
      return user.stakeAdr;
    }
  }

  async getAlphaAccessStatus(id: string) {
    try {
      this.initAccessData();
      console.log('init accessData: ', this.accessData);
      const user: any = await this.userService.validateUserById(id);
      console.log('user: ', user);
      const accessData = await this.catchAssetsfromWallet(
        this.validateWalletState(user),
        CUSTOM_POLICY_ID,
      );
      console.log('updated accessData: ', accessData);
      let userHasAccess = false;
      userHasAccess = this.getHasAccessState(accessData);
      console.log('userHasAccess: ', userHasAccess);
      return userHasAccess;
    } catch (error) {
      return error;
    }
  }

  async updateOwners() {
    const allAssets = await this.assetService.getAll();
    console.log('Current all assets length: ', allAssets.length);
    // await Promise.all(
      // allAssets.map(async (asset: AssetDto) => {
      for (let i = 0; i < allAssets.length; i++) {
        console.log(' ==> ', allAssets[i]);
        const currentWallet: any = await this.getWalletWithAsset(allAssets[i].assetID);
        console.log('currentWallet ==> ', currentWallet);
        if (currentWallet && allAssets[i].owner?.wallet !== currentWallet) {
          console.log(allAssets[i].owner?.wallet, ' ==> ', currentWallet);
          await this.assetService.updateOwnerWallet(allAssets[i].assetID, currentWallet);
        }
      }        
      // })
    // );
    this.logger.debug('End update Owner cron job --- >');
  }

}
