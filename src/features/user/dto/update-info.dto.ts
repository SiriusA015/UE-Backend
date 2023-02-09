import {
    IsNotEmpty,
    IsString,
    Matches,
    IsOptional,
    MaxLength,
    MinLength,
  } from 'class-validator';
  
  export class UpdateInfoDto {
    @IsNotEmpty()
    @IsString()
    @Matches(/[a-zA-Z0-9_-]{2,20}/, {
      message: 'Invalid username',
    })
    username: string;  
  }
  