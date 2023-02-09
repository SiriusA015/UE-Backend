import {
    IsString,
    IsOptional,
  } from 'class-validator';
  
  export class UpdateHandleDto {  
    @IsOptional()
    @IsString()
    discordHandle?: string;

    @IsOptional()
    @IsString()
    twitterHandle?: string;

    @IsOptional()
    @IsString()
    adaHandle?: string;
  }
  