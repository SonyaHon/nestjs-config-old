# @sonyahon/config

This is a config module for NestJS

## Installation
```bash
yarn install https://github.com/SonyaHon/sonyahon_config
# OR
npm install https://github.com/SonyaHon/sonyahon_config
```

## Usage

```typescript
// configs/app.config.ts
@Config('APP') // Prefix of .env keys
export class AppConfig {
  @EnvVar('PORT') // Postfix of .env keys. In this keys APP__PORT env will be used
  @Integer()
  public port = 6969; // One can provide a default value. It will be used if no environmnet variable is present
}

// main.module.ts
@Module({
  imports: [ConfigModule.forRoot([AppConfig], {})]
})
export class MainModule {
}
```

## Getting the config values
There are several ways to get the needed config value:

```typescript
// Get by config token (in injects, app.get, etc)
const config: AppConfig = app.get(getConfigToken(AppConfig));
// Or by config value token
const redisPort: number = app.get(getConfigValueToken(RedisConfig, 'port'));

// Via decorators
@Injectable()
export class SomeService {
  constructor(
    @InjectConfig(AppConfig) // Get the whole config
    private readonly appConfig: AppConfig,
    @InjectValue(RedisConfig, 'port')
    private readonly redisPort: number,
  ) {
  }
}
```

## Describing configurations
### Marking class as a configuration
Each class decorated with `@Config(prefix?: string)` decorator is considered
a config. Note that the `prefix` parameter is optional. 
Examples:
```typescript
@Config('APP') // APP__* env variables will be used for this config
export class AppConfig {
  ...
}

@Config() // Will use only variables which are described via `@EnvVar` decorator
export class NoPrefixConfig {
  ...
}
```
### Configuring properties

If your property is provided via the ENV variable, you should use the `@EnvVar` decorator
```typescript
...

  @EnvVar('VARIABLE') // In case there were no prefix in the `Config` decorator this will look app just the "VARIABLE" env variable. If there was some prefix, then "PREFIX__VARIABLE" env will be used.
  public variable = 'some-default-value'; // You can provide a default value, which will be used if the desired env variable is not presented
...
```

### Properties validation
There are some default validation decorators for properties:
* `@Integer(options?: {from?: number, to?: number})`: ensures that the passed variable is an integer. You can optionally pass `from` and `to` options to ensure that this integer is in range.
* `@String(options?: {withLength?: number, from?: number, to?: number})`: ensures that the passed variable is a string with specified length.
* `@AnyNumber(options?: {from?: number, to?: number})`: same as `@Integer` but accepts floats too.
* `@Boolean()`: tries to convert a string "true"/"false" to a boolean value. Note that it can accept only this 2 strings.
* `JavaScriptDate()`: tries to convert input to a JavaScriptDate. Throws if this conversion fails
* `@Initialize(initializer: (value: string) => any)`: applies initializer to the value.
* `@Email()`: Validates the string w/ a email RegExp. 
Examples:
```typescript
...
  @EnvVar('PORT')     // Looks  for the "PORT" env
  @Integer()          // Ensures that it is an Int
  public port = 5432; // Default value if "PORT" env is not provided
...
...
  @EnvVar('PASSWORD')  
  @String({from: 8})   
  public port = "suppa"; // This will throw an error in case the "PASSWORD" env is not found or it is too short. Cause the default value "suppa" will not pass the "{from: 8}" validation test
```

### Custom validators
Sometimes the included validators are not enough. In this case you can leverage these to methods:  

`createPropValidator(validator: (key: string, value: any, options?: any) => any)`  

**Note 1:** Remember that value has type of `any` because the default values are going throw these validations too.  
**Note 2:** If you will throw `ConfigModuleValidationException` it will be handled to show better error reports.
```typescript
// Exmaple of implementing a simple validator via createPropValidator
const TwoOrEight = createPropValidator((key, value: any, options?: {fallbackToTwo: boolean}) => {
  if (value === 2 || value === 8) return value; // No need to do any work. Probably one of the default values;
  const num = parseInt(value);
  if (isNan(num) || num !== 2 || num !== 8) {
    if (options.fallbackToTwo) { // fallbackToTwo -> just return the fallback value
      return 2;
    } 
    throw new ConfigModuleValidationException('value is not 2 or 8'); // Passed value is not a number or it is not equal to 2 or 8. 
  }
  return value;
});

// Somewhere in config:
@Config() 
export class Configuration {
  @EnvVar('TWO_OR_EIGHT')
  @TwoOrEight()
  public twoOrEight = 2;
}
```

`createRegExpPropValidator(regexp: RegExp, name?: string)`  

This is used if you need to use a regexp validation. `name` is used in the error messages

```typescript
// Example of implementing a simple regexp validator via createRegExpPropValidator
const ContainsAPP = createRegExpPropValidator(/.*APP.*/, 'ContainsAPP');

// Using
@Config()
export class SomeConfig {
  @EnvVar('APP_NAME')
  @ContainsAPP()
  public app;
}

// APP_NAME="NOT CONTAIN NEEDED INFO" node main.js
// Exception: value does not match ContainsAPP regexp. Where: SomeConfig::app. Passed value: <NOT CONTAIN NEEDED INFO> with type of "string"
```
