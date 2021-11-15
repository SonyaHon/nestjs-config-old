import { Inject } from '@nestjs/common';
import { getConfigToken } from '../utl/provider-naming';
import { Constructor } from '@nestjs/common/utils/merge-with-values.util';

export const InjectConfig = (config: Constructor<any>): ParameterDecorator => {
  return Inject(getConfigToken(config));
};
