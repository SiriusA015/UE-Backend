import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { createSchemaForClassWithMethods } from '../../../shared/mongoose/create-schema';
import { OwnerDto } from '../dto/owner.dto';

@Schema()
export class Asset extends Document {
    @Prop()
    assetID: string;
    @Prop()
    name: string;
    @Prop()
    image: string;
    @Prop()
    info: string;
    @Prop()
    link: string;
    @Prop()
    season: string;
    @Prop()
    type: string;
    @Prop()
    x: number;
    @Prop()
    y: number;
    @Prop()
    estateId?: string;
    @Prop()
    owner?: OwnerDto;
}

export const AssetSchema = createSchemaForClassWithMethods(Asset);
