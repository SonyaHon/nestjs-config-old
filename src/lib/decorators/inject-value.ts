import { Inject } from '@nestjs/common';
import { Constructor } from '@nestjs/common/utils/merge-with-values.util';
import { getConfigValueToken } from '../utl/provider-naming';

export const InjectValue = <
  T extends Constructor<any>,
  Z extends keyof InstanceType<T>,
>(
  value: T,
  prop: Z,
): ParameterDecorator => {
  return Inject(getConfigValueToken(value, prop as string));
};
