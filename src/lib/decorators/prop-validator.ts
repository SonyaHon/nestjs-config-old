export const CM_PROPERTY_CHECKS = Symbol();

export class ConfigModuleValidationException extends Error {}

export const createPropValidator = <TOptions>(
  checker: (key: string, value: any, options?: TOptions) => any,
): ((options?: TOptions) => PropertyDecorator) => {
  return function (options?: TOptions) {
    return function (target, propertyKey) {
      const currentAllChecks =
        Reflect.getMetadata(CM_PROPERTY_CHECKS, target.constructor) || {};
      const currentPropChecks = currentAllChecks[propertyKey] || [];
      currentPropChecks.push({
        checker,
        options,
      });
      currentAllChecks[propertyKey] = currentPropChecks;
      Reflect.defineMetadata(
        CM_PROPERTY_CHECKS,
        currentAllChecks,
        target.constructor,
      );
    };
  };
};

export const createRegExpPropValidator = (
  regexp: RegExp,
  regexpName?: string,
) => {
  return createPropValidator((key, value) => {
    if (value && typeof value === 'string' && value.match(regexp)) {
      return value;
    } else {
      throw new ConfigModuleValidationException(
        `value does not match ${
          regexpName ? regexpName : regexp.toString()
        } regexp`,
      );
    }
  });
};
