export const CM_CONFIG_PREFIX = Symbol();

export const Config = (prefix?: string): ClassDecorator => {
  return function (target) {
    Reflect.defineMetadata(CM_CONFIG_PREFIX, prefix || '', target);
  };
};
