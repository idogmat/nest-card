export class DeviceOutputModel {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}

export class DeviceDBModel {
  id: string;
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}

// MAPPERS

export const DeviceOutputModelMapper = (device: DeviceDBModel): DeviceOutputModel => {
  const outputModel = new DeviceOutputModel();
  outputModel.ip = device.ip;
  outputModel.title = device.title;
  outputModel.deviceId = device.id;
  outputModel.lastActiveDate = new Date(device.lastActiveDate).toISOString();

  return outputModel;
};
