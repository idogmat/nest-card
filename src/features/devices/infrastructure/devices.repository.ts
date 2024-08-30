import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument, DeviceModelType } from '../domain/device.entity';

@Injectable()
export class DevicesRepository {
  constructor(@InjectModel(Device.name) private DeviceModel: DeviceModelType) { }

  async create(device: Device): Promise<DeviceDocument> {
    const model = await new this.DeviceModel(device);
    await model.save();
    return model;
  }

  async delete(id: string): Promise<boolean> {
    const deletingResult = await this.DeviceModel.deleteOne({ _id: id });

    return deletingResult.deletedCount === 1;
  };

  async update(id: string, newModel: Comment) {
    const model = await this.DeviceModel.findByIdAndUpdate({ _id: id }, { ...newModel });
    return model;
  }
}
