import { Post, Get, Param, Query } from '@nestjs/common';
import { Body, Controller, UseGuards } from '@nestjs/common';
import { CardanoService } from './cardano.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('cardano')
export class CardanoController {
  constructor(private cardanoService: CardanoService) {

  }

  @UseGuards(JwtAuthGuard)
  @Get('GetAlphaAccessStatus/:id')
  async getAlphaAccessStatus(@Param('id') id: string) {
    const result = await this.cardanoService.getAlphaAccessStatus(id);
    return result;
  }
}
