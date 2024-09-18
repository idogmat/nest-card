import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DevicesRepository } from '../infrastructure/devices.repository';
import { DeviceDocument } from '../domain/device.entity';
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
    lastActiveDate?: number
  ): Promise<DeviceDocument> {

    const res = await this.dataSource.query(`
      INSERT INTO public.device_pg (
      ip,
      title,
      user_id,
      last_active_date
      )
      VALUES ($1, $2, $3, $4) RETURNING *
      `, [ip, title, userId, lastActiveDate || new Date().getTime()]);
    console.log(res);
    const device = await this.devicesRepository.getById(res[0].id);
    return device;
  }

  async getById(deviceId: string) {
    const res = await this.dataSource.query(`
      SELECT *
	    FROM public.device_pg
      WHERE id = $1;
      `, [deviceId]);
    return res[0];
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
