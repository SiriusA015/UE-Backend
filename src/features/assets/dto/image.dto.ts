import { IsString } from 'class-validator';

export class ImageDto {
  @IsString()
  assetID: string;

  @IsString()
  image: string;
}
