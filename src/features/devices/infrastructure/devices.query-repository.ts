import { Injectable } from '@nestjs/common';
import { DeviceOutputModel, DeviceOutputModelMapper } from '../api/model/output/device.output.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../domain/device.entity';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
  ) { }

  async getAll(
    userId: string
  ): Promise<DeviceOutputModel[] | []> {
    const devices = await this.deviceRepo.createQueryBuilder("d")
      .where("d.userId = :userId", { userId })
      .orderBy("d.lastActiveDate")
      .getMany();

    const mappedComments = devices.map(e => DeviceOutputModelMapper(e));
    return mappedComments;
  }
}
