import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { Public } from './public';
import { DeviceGuard } from '@/modules/device/guard/device.guard';

export const IS_FOR_DEVICE = 'for_device';
export const ForDevice = () => {
  return applyDecorators(
    Public(),
    SetMetadata(IS_FOR_DEVICE, true),
    UseGuards(DeviceGuard),
  );
};
