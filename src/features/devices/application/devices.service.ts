import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DevicesRepository } from '../infrastructure/devices.repository';
import { Device, DeviceDocument, DeviceModelType } from '../domain/device.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class DevicesService {
  constructor(
    private readonly devicesRepository: DevicesRepository,
    @InjectModel(Device.name) private DeviceModel: DeviceModelType
  ) { }
  async create(
    ip: string,
    title: string,
    userId: string,
    lastActiveDate?: number
  ): Promise<DeviceDocument> {
    const newDevice: any = {
      ip,
      title,
      userId,
      lastActiveDate: lastActiveDate || new Date().getTime()
    };
    const model = await new this.DeviceModel(newDevice);
    const deviceId = await this.devicesRepository.save(model);
    const device = await this.devicesRepository.getById(deviceId);
    return device;
  }

  async getById(deviceId: string) {
    return await this.devicesRepository.getById(deviceId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const device = await this.devicesRepository.getById(id);
    if (!device) {
      throw new NotFoundException();
    }
    if (device.userId !== userId) throw new ForbiddenException();
    return this.devicesRepository.delete(id);
  }

  async deleteAll(id: string, userId: string): Promise<void> {
    await this.devicesRepository.deleteAll(id, userId);
  }

  async updateDate(
    id,
    updateModel
  ): Promise<boolean> {

    await this.devicesRepository.updateDate(id, updateModel);
    return true;
  }

  async updateFields(
    id,
    updateModel
  ): Promise<boolean> {

    await this.devicesRepository.updateFields(id, updateModel);
    return true;
  }

  async _clear() {
    await this.devicesRepository._clear();
  }
}
