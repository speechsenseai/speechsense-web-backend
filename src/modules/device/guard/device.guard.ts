import { AuthGuard } from '@nestjs/passport';
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_FOR_DEVICE } from '@/decorators/forDevice';

@Injectable()
export class DeviceGuard extends AuthGuard(['device-jwt']) {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isForDevice = this.reflector.getAllAndOverride<boolean>(
      IS_FOR_DEVICE,
      [context.getHandler(), context.getClass()],
    );

    if (isForDevice) {
      return super.canActivate(context);
    }
    throw new ForbiddenException({ message: 'Allowed only for Devices' });
  }
}
