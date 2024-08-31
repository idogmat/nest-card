import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";

@Schema({ _id: true })
export class Device {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Number, default: new Date().getTime() })
  lastActiveDate: number;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
DeviceSchema.loadClass(Device);

// Types
export type DeviceDocument = HydratedDocument<Device>;

export type DeviceModelType = Model<DeviceDocument>;