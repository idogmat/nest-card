import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DevicesRepository } from '../infrastructure/devices.repository';
import { DevicePg } from '../domain/device.entity';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class DevicesService {
  constructor(
    private readonly devicesRepository: DevicesRepository,
    @InjectDataSource() protected dataSource: DataSource
  ) { }
  async create(
    ip: string,
    title: string,
    userId: string,
    lastActiveDate?: Date
  ): Promise<DevicePg> {
    const device = await this.devicesRepository.create(ip,
      title,
      userId,
      lastActiveDate || new Date());
    return device;
  }

  async getById(deviceId: string) {
    const device = await this.devicesRepository.getById(deviceId);
    return device;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const device = await this.devicesRepository.getById(id);
    if (!device) {
      throw new NotFoundException();
    }
    if (device.userId !== userId) throw new ForbiddenException();
    return this.devicesRepository.delete(device);
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
