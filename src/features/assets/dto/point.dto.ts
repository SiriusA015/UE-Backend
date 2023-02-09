import {
    IsNumber,
  } from 'class-validator';
  
  export class PointDto {  

    @IsNumber()
    x: number;

    @IsNumber()
    y: number;
  }