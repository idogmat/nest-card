import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DevicesRepository } from '../infrastructure/devices.repository';
import { DeviceDocument } from '../domain/device.entity';

@Injectable()
export class DevicesService {
  constructor(
    private readonly devicesRepository: DevicesRepository,
  ) { }
  async create(
    ip: string,
    title: string,
    userId: string,
    lastActiveDate?: number
  ): Promise<DeviceDocument> {

    const devices = await this.devicesRepository.findByUserId(userId);
    const diviceExist = devices.find(d => (ip === d.ip && title === d.title));
    if (diviceExist) {
      const deviceForReturn = await this.devicesRepository.updateFields(diviceExist.id, { ...diviceExist, lastActiveDate });
      return deviceForReturn;
    } else {
      const newDevice: any = {
        ip,
        title,
        userId,
        lastActiveDate: lastActiveDate || new Date().getTime()
      };
      const deviceForReturn = await this.devicesRepository.create(newDevice);
      return deviceForReturn;
    }
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
}
