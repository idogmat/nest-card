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
import { JwtAuthGuard } from 'src/features/auth/guards/jwt-auth.guard';
import { AuthGetGuard } from 'src/common/guards/auth-get.guard';
import { DevicesRepository } from '../infrastructure/devices.repository';
import { DeviceOutputModel } from './model/output/device.output.model';
import { DevicesService } from '../application/devices.service';

@ApiTags('Devices')
@Controller('security/')
export class DevicesController {
  constructor(
    private readonly devicesQueryRepository: DevicesQueryRepository,
    private readonly devicesRepository: DevicesRepository,
    private readonly devicesService: DevicesService,
  ) { }

  @UseGuards(AuthGetGuard)
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Req() req?
  ) {
    const comment: DeviceOutputModel =
      await this.devicesQueryRepository.getById(id);
    if (!comment) throw new NotFoundException;
    return comment;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Param('id') id: string,
    @Req() req,
  ) {
    const comment = await this.devicesQueryRepository.getById(id);
    if (!comment) {
      throw new NotFoundException();
    }

    const deletingResult: boolean = await this.devicesRepository.delete(id);

    if (!deletingResult) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
