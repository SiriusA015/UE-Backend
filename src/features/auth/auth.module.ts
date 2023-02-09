import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { authConfig } from './config/auth.config';
import { UserModule } from '../user/user.module';

const facebook = authConfig.facebook;

@Module({
  imports: [
    ConfigModule,
    JwtModule.register(null),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard, AuthService, JwtModule, ConfigModule, UserModule],
})
export class AuthModule {}
