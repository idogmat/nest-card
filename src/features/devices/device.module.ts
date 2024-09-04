import { Module } from "@nestjs/common";
import { DevicesRepository } from "./infrastructure/devices.repository";
import { DevicesController } from "./api/devices.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Device, DeviceSchema } from "./domain/device.entity";
import { DevicesService } from "./application/devices.service";
import { JwtService } from "@nestjs/jwt";
import { DevicesQueryRepository } from "./infrastructure/devices.query-repository";

@Module({
  imports: [MongooseModule.forFeature([
    { name: Device.name, schema: DeviceSchema },
  ])],
  controllers: [DevicesController],
  providers: [
    DevicesRepository, DevicesQueryRepository, DevicesService, JwtService
  ],
  exports: [DevicesService]
})
export class DeviceModule { }