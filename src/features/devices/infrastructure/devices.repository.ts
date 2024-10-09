import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DevicePg } from '../domain/device.entity';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(DevicePg)
    private readonly deviceRepo: Repository<DevicePg>,
  ) { }

  async create(ip: string,
    title: string,
    userId: string,
    lastActiveDate?: Date): Promise<DevicePg | null> {
    const device = this.deviceRepo.create({
      ip,
      title,
      userId,
      lastActiveDate: lastActiveDate || new Date(),
    });

    const savedDevice = await this.deviceRepo.save(device);
    return savedDevice;
  }

  async getById(id: string): Promise<DevicePg | null> {
    const device = await this.deviceRepo.findOneBy({ id: id });
    if (!device) {
      return null;
    }
    return device;
  }

  async delete(device: DevicePg): Promise<boolean> {
    const result = await this.deviceRepo.remove(device);
    return !!result;
  };

  async deleteAll(id: string, userId: string): Promise<boolean> {
    const result = await this.deviceRepo.createQueryBuilder()
      .delete()
      .from(DevicePg)
      .where("id != :id", { id })
      .andWhere("userId = :userId", { userId })
      .execute();
    return !!result.affected;
  };

  async updateDate(id: string, lastActiveDate: string) {
    await this.deviceRepo.createQueryBuilder()
      .update(DevicePg) // Specify that you want to perform an update operation on the Device entity
      .set({ lastActiveDate }) // Set the new value for lastActiveDate
      .where("id = :id", { id }) // Condition for updating (matching ID)
      .execute();
  }

  async updateFields(id: string, newModel: DevicePg) {
    await this.deviceRepo.createQueryBuilder()
      .update(DevicePg)
      .set({
        id: newModel.ip,
        title: newModel.title,
        lastActiveDate: newModel.lastActiveDate
      })
      .where("id = :id", { id })
      .execute();
  }
}
