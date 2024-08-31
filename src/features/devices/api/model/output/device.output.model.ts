import { DeviceDocument } from "src/features/devices/domain/device.entity";

export class DeviceOutputModel {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}

// MAPPERS

export const DeviceOutputModelMapper = (device: DeviceDocument): DeviceOutputModel => {
  const outputModel = new DeviceOutputModel();
  outputModel.ip = device.ip;
  outputModel.title = device.title;
  outputModel.deviceId = device.id;
  outputModel.lastActiveDate = new Date(device.lastActiveDate).toISOString();

  return outputModel;
};
