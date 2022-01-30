export const CM_CONFIG_PROP_ENV_NAMES = Symbol();

export const EnvVar = (name: string): PropertyDecorator => {
  return function(target, propertyKey) {
    const current =
      Reflect.getMetadata(CM_CONFIG_PROP_ENV_NAMES, target.constructor) || [];
    current.push({ propertyKey, name });
    Reflect.defineMetadata(
      CM_CONFIG_PROP_ENV_NAMES,
      current,
      target.constructor,
    );
  };
};
