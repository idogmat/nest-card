import { Injectable } from '@nestjs/common';
import { DevicesRepository } from '../infrastructure/devices.repository';
import { DeviceOutputModel, DeviceOutputModelMapper } from '../api/model/output/device.output.model';

@Injectable()
export class DevicesService {
  constructor(
    private readonly devicesRepository: DevicesRepository,
  ) { }
  async create(
    postId: string,
    content: string,
    userId: string,
    userLogin: string,
  ): Promise<DeviceOutputModel> {

    const newComment: any = {
      postId,
      content,
      commentatorInfo: {
        userId,
        userLogin
      },
      createdAt: new Date().getTime()
    };

    const comment = await this.devicesRepository.create(newComment);

    return DeviceOutputModelMapper(comment);
  }

  async delete(id: string): Promise<boolean> {
    return this.devicesRepository.delete(id);
  }

  async update(
    id,
    updateModel
  ): Promise<boolean> {

    await this.devicesRepository.update(id, updateModel);
    return true;
  }
}
