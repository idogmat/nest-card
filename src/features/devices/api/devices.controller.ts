import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DevicesQueryRepository } from '../infrastructure/devices.query-repository';
import { DeviceOutputModel } from './model/output/device.output.model';
import { DevicesService } from '../application/devices.service';
import { isValidObjectId } from 'mongoose';
import { RefreshGuard } from 'src/common/guards/refresh.guard';

@ApiTags('Devices')
@Controller('security/devices')
export class DevicesController {
  constructor(
    private readonly devicesQueryRepository: DevicesQueryRepository,
    private readonly devicesService: DevicesService,
  ) { }

  @UseGuards(RefreshGuard)
  @Get()
  async getAll(
    @Req() req?
  ) {
    const devices: DeviceOutputModel[] | [] =
      await this.devicesQueryRepository.getAll(req.user.userId);
    return devices;
  }

  @UseGuards(RefreshGuard)
  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Param('id') id: string,
    @Req() req,
  ) {
    if (!isValidObjectId(id)) throw new NotFoundException();
    const device = await this.devicesService.delete(id, req.user.userId);
    if (!device) {
      throw new NotFoundException();
    }
  }

  @UseGuards(RefreshGuard)
  @Delete()
  @HttpCode(204)
  async deleteAll(
    @Req() req,
  ) {
    await this.devicesService.deleteAll(req.user.deviceId, req.user.userId);
  }
}