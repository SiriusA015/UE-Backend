import { Module } from '@nestjs/common';
import { AssetsModule } from '../assets/assets.module';
import { CardanoController } from './cardano.controller';
import { CardanoService } from './cardano.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AssetsModule, AuthModule],
  controllers: [CardanoController],
  providers: [CardanoService],
})
export class CardanoModule {}
