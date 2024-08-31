import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceModelType } from '../domain/device.entity';
import { DeviceOutputModel, DeviceOutputModelMapper } from '../api/model/output/device.output.model';

@Injectable()
export class DevicesQueryRepository {
  constructor(@InjectModel(Device.name) private DeviceModel: DeviceModelType) { }

  async getAll(
    userId: string
  ): Promise<DeviceOutputModel[] | []> {
    const comments = await this.DeviceModel
      .find({ userId })
      .sort({
        createdAt: 1,
      });

    const mappedComments = comments.map(e => DeviceOutputModelMapper(e));
    return mappedComments;
  }
}
