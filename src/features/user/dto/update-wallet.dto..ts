import { IsOptional, IsString } from 'class-validator';

export class UpdateWalletDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  stakeAdr?: string;
}
