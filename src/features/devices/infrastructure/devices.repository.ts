import { Injectable } from '@nestjs/common';
import { Device, DeviceDocument } from '../domain/device.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) { }

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
    const res = await this.dataSource.query(`
      SELECT *
	    FROM public.device_pg
      WHERE "userId" = $1;
      `, [userId]);

    if (res === null) {
      return null;
    }

    return res[0];
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.dataSource.query(`
      DELETE FROM public.device_pg
      WHERE id = $1;
      `, [id]);
    return res[1] === 1;
  };

  async deleteAll(id: string, userId: string): Promise<void> {
    const res = await this.dataSource.query(`
      DELETE FROM public.device_pg
      WHERE id != $1 AND "userId" = $2;
      `, [id, userId]);

    console.log(res);
    return res[1];
  };

  async updateDate(id: string, lastActiveDate: string) {
    const res = await this.dataSource.query(`
      UPDATE public.device_pg
      SET "lastActiveDate" = $2
      WHERE id = $1;
      `, [id, lastActiveDate]);

    if (res === null) {
      return null;
    }

    return res[0];
  }

  async updateFields(id: string, newModel: Device) {
    const res = await this.dataSource.query(`
      UPDATE public.device_pg
      SET id = $2, title = $3, "lastActiveDate" = $4
      WHERE id = $1
      RETURNING *;
      `, [
      id,
      newModel.ip,
      newModel.title,
      newModel.lastActiveDate
    ]);

    if (res === null) {
      return null;
    }

    return res[0];
  }
}
