import { Injectable } from '@nestjs/common';
import { DeviceOutputModel, DeviceOutputModelMapper } from '../api/model/output/device.output.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) { }

  async getAll(
    userId: string
  ): Promise<DeviceOutputModel[] | []> {
    const comments = await this.dataSource.query(`
      SELECT *
	    FROM public.device_pg
      WHERE "userId" = $1
      ORDER BY "createdAt";
      `, [userId]);

    if (comments === null) {
      return null;
    }

    const mappedComments = comments.map(e => DeviceOutputModelMapper(e));
    return mappedComments;
  }
}
