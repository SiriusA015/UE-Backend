import {
    IsString,
    IsNumber,
    IsOptional
  } from 'class-validator';
  import { OwnerDto } from './owner.dto';

  export class AssetDto {  
    @IsString()
    assetID: string;

    @IsString()
    name: string;

    @IsString()
    image: string;

    @IsString()
    info: string;

    @IsString()
    link: string;

    @IsString()
    season: string;

    @IsString()
    type: string;

    @IsNumber()
    x: number;

    @IsNumber()
    y: number;

    @IsOptional()
    @IsString()
    estateId?: string;
    
    @IsOptional()
    owner?: OwnerDto;
  }

  export class AssetListDto {  
    @IsString()
    asset: string;

    @IsString()
    quantity: string;
  }