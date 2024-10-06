import { Module } from "@nestjs/common";
import { DevicesRepository } from "./infrastructure/devices.repository";
import { DevicesController } from "./api/devices.controller";
import { DevicesService } from "./application/devices.service";
import { JwtService } from "@nestjs/jwt";
import { DevicesQueryRepository } from "./infrastructure/devices.query-repository";
import { DevicePg } from "./domain/device.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forFeature([DevicePg])
  ],
  controllers: [DevicesController],
  providers: [
    DevicesRepository, DevicesQueryRepository, DevicesService, JwtService
  ],
  exports: [DevicesService]
})
export class DeviceModule { }