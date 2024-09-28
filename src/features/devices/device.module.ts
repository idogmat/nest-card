import { Module } from "@nestjs/common";
import { DevicesRepository } from "./infrastructure/devices.repository";
import { DevicesController } from "./api/devices.controller";
import { DevicesService } from "./application/devices.service";
import { JwtService } from "@nestjs/jwt";
import { DevicesQueryRepository } from "./infrastructure/devices.query-repository";

@Module({
  controllers: [DevicesController],
  providers: [
    DevicesRepository, DevicesQueryRepository, DevicesService, JwtService
  ],
  exports: [DevicesService]
})
export class DeviceModule { }