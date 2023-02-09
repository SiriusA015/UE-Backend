import {
  IsString,
  IsOptional
} from 'class-validator';
  
  export class OwnerDto {  

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    wallet?: string;
    
    @IsOptional()
    @IsString()
    discord?: string;

    @IsOptional()
    @IsString()
    twitter?: string;

    @IsOptional()
    @IsString()
    ada?: string;

  }