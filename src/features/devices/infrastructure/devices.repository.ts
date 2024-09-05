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

  async getById(id: string): Promise<DeviceDocument | null> {
    const device = await this.DeviceModel.findById(id);
    return device;
  }

  async findByUserId(userId: string): Promise<DeviceDocument[] | null> {
    const devices = await this.DeviceModel.find({ userId });

    return devices;
  }

  async delete(id: string): Promise<boolean> {
    const deletingResult = await this.DeviceModel.deleteOne({ _id: id });

    return deletingResult.deletedCount === 1;
  };

  async deleteAll(id: string, userId: string): Promise<void> {
    await this.DeviceModel.deleteMany({ userId, _id: { $ne: id } });
  };

  async updateDate(id: string, lastActiveDate: string) {
    const model = await this.DeviceModel.findByIdAndUpdate(id, { lastActiveDate }, { returnDocument: 'after' });
    return model;
  }

  async updateFields(id: string, newModel: Device) {
    const model = await this.DeviceModel.findByIdAndUpdate(id,
      {
        ip: newModel.ip,
        title: newModel.title,
        lastActiveDate: newModel.lastActiveDate
      },
      { returnDocument: 'after' });
    return model;
  }

  async _clear() {
    await this.DeviceModel.deleteMany({});
  }
}
