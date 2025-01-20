import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../domain/device.entity';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
  ) { }

  async create(ip: string,
    title: string,
    userId: string,
    lastActiveDate?: Date): Promise<Device | null> {
    const device = this.deviceRepo.create({
      ip,
      title,
      userId,
      lastActiveDate: lastActiveDate || new Date(),
    });

    const savedDevice = await this.deviceRepo.save(device);
    return savedDevice;
  }

  async getById(id: string): Promise<Device | null> {
    const device = await this.deviceRepo.findOneBy({ id: id });
    if (!device) {
      return null;
    }
    return device;
  }

  async delete(device: Device): Promise<boolean> {
    const result = await this.deviceRepo.remove(device);
    return !!result;
  };

  async deleteAll(id: string, userId: string): Promise<boolean> {
    const result = await this.deviceRepo.createQueryBuilder()
      .delete()
      .from(Device)
      .where("id != :id", { id })
      .andWhere("userId = :userId", { userId })
      .execute();
    return !!result.affected;
  };

  async updateDate(id: string, lastActiveDate: string) {
    await this.deviceRepo.createQueryBuilder()
      .update(Device)
      .set({ lastActiveDate })
      .where("id = :id", { id })
      .execute();
  }

  async updateFields(id: string, newModel: Device) {
    await this.deviceRepo.createQueryBuilder()
      .update(Device)
      .set({
        id: newModel.ip,
        title: newModel.title,
        lastActiveDate: newModel.lastActiveDate
      })
      .where("id = :id", { id })
      .execute();
  }
}
