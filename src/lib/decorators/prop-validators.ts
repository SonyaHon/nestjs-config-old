import {
  ConfigModuleValidationException,
  createPropValidator,
  createRegExpPropValidator,
} from './prop-validator';

export const Integer = createPropValidator(
  (key: string, value: any, options?: { from?: number; to?: number }) => {
    const num = Number(value);
    if (Number.isNaN(num) || !Number.isSafeInteger(num)) {
      throw new ConfigModuleValidationException('value is not an integer');
    }

    if (options?.from && num < options.from) {
      throw new ConfigModuleValidationException('value is not a valid integer');
    }
    if (options?.to && num > options.to) {
      throw new ConfigModuleValidationException('value is not a valid integer');
    }

    return num;
  },
);

export const String = createPropValidator(
  (
    key,
    value,
    options?: { withLength?: number; from?: number; to?: number },
  ) => {
    if (typeof value !== 'string') {
      throw new ConfigModuleValidationException('value is not a valid string');
    }

    if (options?.withLength && value.length !== options.withLength) {
      throw new ConfigModuleValidationException('value is not a valid string');
    }

    if (options?.from && value.length < options.from) {
      throw new ConfigModuleValidationException('value is not a valid string');
    }

    if (options?.to && value.length > options.to) {
      throw new ConfigModuleValidationException('value is not a valid string');
    }

    return value;
  },
);

export const AnyNumber = createPropValidator(
  (key: string, value: any, options?: { from?: number; to?: number }) => {
    const num = Number(value);
    if (Number.isNaN(num)) {
      throw new ConfigModuleValidationException('value is not an number');
    }
    if (options?.from && num < options.from) {
      throw new ConfigModuleValidationException('value is not a valid number');
    }
    if (options?.to && num > options.to) {
      throw new ConfigModuleValidationException('value is not a valid number');
    }
    return num;
  },
);

export const Email = createRegExpPropValidator(
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
  'Email',
);

export const Boolean = createPropValidator((key, value) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new ConfigModuleValidationException('value is not a boolean');
});

export const JavaScriptDate = createPropValidator((key, value) => {
  if (isNaN(Date.parse(value))) {
    throw new ConfigModuleValidationException('value is not a date');
  }
  return new Date(value);
});
