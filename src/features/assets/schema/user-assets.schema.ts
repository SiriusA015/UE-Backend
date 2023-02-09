import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from 'src/features/user/schema/user.schema';
import { createSchemaForClassWithMethods } from 'src/shared/mongoose/create-schema';
import { ObjectId } from '../../../shared/mongoose/object-id';
import { AssetDto } from '../dto/asset.dto';

@Schema()
export class UserAssets extends Document {
  @Prop()
  assets: AssetDto[];

  @Prop({ type: ObjectId, ref: User.name })
  owner: User;
}

export const UserAssetsSchema = createSchemaForClassWithMethods(UserAssets);