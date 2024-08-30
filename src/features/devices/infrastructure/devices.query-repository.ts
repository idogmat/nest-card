import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pagination, PaginationOutput } from 'src/base/models/pagination.base.model';
import { Device, DeviceModelType } from '../domain/device.entity';
import { DeviceOutputModel, DeviceOutputModelMapper } from '../api/model/output/device.output.model';

@Injectable()
export class DevicesQueryRepository {
  constructor(@InjectModel(Device.name) private DeviceModel: DeviceModelType) { }

  async getById(id: string): Promise<DeviceOutputModel | null> {
    const device = await this.DeviceModel.findById(id);

    if (device === null) {
      return null;
    }
    return DeviceOutputModelMapper(device);
  }

  async getAll(
    pagination: Pagination,
    id: string,
  ): Promise<PaginationOutput<DeviceOutputModel>> {
    const comments = await this.DeviceModel
      .find({ postId: id })
      .sort({
        [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
      })
      .skip(pagination.getSkipItemsCount())
      .limit(pagination.pageSize);

    const totalCount = await this.DeviceModel.countDocuments({ postId: id });

    const mappedComments = comments.map(e => DeviceOutputModelMapper(e));

    return new PaginationOutput<DeviceOutputModel>(
      mappedComments,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }
}
