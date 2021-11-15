import { Constructor } from '@nestjs/common/utils/merge-with-values.util';

export const getConfigToken = (classConstructor: Constructor<any>) => {
  return `config__${classConstructor.name}`;
};

export const getConfigValueToken = (
  classConstructor: Constructor<any>,
  propertyKey: string,
) => {
  return `config__value__${classConstructor.name}__${propertyKey}`;
};
