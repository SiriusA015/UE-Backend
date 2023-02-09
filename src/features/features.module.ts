import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationModule } from './notification/notification.module';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';
import { AssetsModule } from './assets/assets.module';
import { CardanoModule } from './cardano/cardano.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    RoomModule,
    MessagesModule,
    NotificationModule,
    AssetsModule,
    CardanoModule
  ],
  controllers: [],
  exports: [
    AuthModule,
    UserModule,
    RoomModule,
    MessagesModule,
    NotificationModule,
    AssetsModule,
    CardanoModule
  ],
})
export class FeaturesModule {}
