import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument, DeviceModelType } from '../domain/device.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name) private DeviceModel: DeviceModelType,
    @InjectDataSource() protected dataSource: DataSource
  ) { }

  async save(model: DeviceDocument): Promise<string> {
    await model.save();
    return model.id;
  }

  async getById(id: string): Promise<DeviceDocument | null> {
    const res = await this.dataSource.query(`
      SELECT *
	    FROM public.device_pg
      WHERE id = $1;
      `, [id]);

    if (res === null) {
      return null;
    }

    return res[0];
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
