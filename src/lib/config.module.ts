import { DynamicModule, Module, Provider } from '@nestjs/common';
import { getConfigToken, getConfigValueToken } from './utl/provider-naming';
import { Constructor } from '@nestjs/common/utils/merge-with-values.util';
import { CM_CONFIG_PREFIX } from './decorators/config';
import { CM_CONFIG_PROP_ENV_NAMES } from './decorators/env-var';
import {
  CM_PROPERTY_CHECKS,
  ConfigModuleValidationException,
} from './decorators/prop-validator';

export interface IConfigModuleOptions {
  defineGlobal?: boolean;
  useFile?: string;
  useString?: string;
}

@Module({})
export class ConfigModule {
  private static sharedProviders: Provider[] = [];

  private static parseConfigs(
    configConstructors: Constructor<any>[],
    envs: Record<string, unknown>,
  ) {
    ConfigModule.sharedProviders = configConstructors.flatMap(
      (ConfigConstructor: any) => {
        const provider = new ConfigConstructor();

        const configPrefix = Reflect.getMetadata(
          CM_CONFIG_PREFIX,
          ConfigConstructor,
        );

        const configValues: { propertyKey: string; name: string }[] =
          Reflect.getMetadata(CM_CONFIG_PROP_ENV_NAMES, ConfigConstructor);

        configValues.forEach(({ propertyKey, name }) => {
          const envVar =
            configPrefix !== '' ? `${configPrefix}__${name}` : name;
          provider[propertyKey] = envs[envVar] ?? provider[propertyKey];
        });

        const valueCheckers: Record<
          string,
          {
            checker: (key: string, value: any, options?: any) => any;
            options: any;
          }[]
        > = Reflect.getMetadata(CM_PROPERTY_CHECKS, ConfigConstructor) || [];

        Object.entries(valueCheckers).forEach(([key, checks]) => {
          checks.forEach(({ checker, options }) => {
            try {
              provider[key] = checker(key, provider[key], options);
            } catch (err: unknown) {
              if (err instanceof ConfigModuleValidationException) {
                throw new ConfigModuleValidationException(
                  `${err.message}. Where: ${
                    ConfigConstructor.name
                  }::${key}. Passed value: <${
                    provider[key]
                  }> with type of "${typeof provider[key]}"`,
                );
              } else {
                throw err;
              }
            }
          });
        });

        const providers: Provider[] = [
          {
            provide: getConfigToken(ConfigConstructor),
            useValue: provider,
          },
          ...Object.entries(provider).map(
            ([key]) =>
              ({
                provide: getConfigValueToken(ConfigConstructor, key),
                useValue: provider[key] || null,
              } as Provider),
          ),
        ];
        return providers;
      },
    );
  }

  static forRoot(
    configs: any[],
    options: IConfigModuleOptions = {},
  ): DynamicModule {
    let envs;
    if (options.useFile) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('dotenv').config({ path: options.useFile });
      envs = process.env;
    } else if (options.useString) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      envs = require('dotenv').parse(Buffer.from(options.useString));
    } else {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('dotenv').config();
      envs = process.env;
    }

    ConfigModule.parseConfigs(configs, envs);

    return {
      module: ConfigModule,
      providers: ConfigModule.sharedProviders,
      global: !!options.defineGlobal,
      exports: ConfigModule.sharedProviders,
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: ConfigModule,
      providers: ConfigModule.sharedProviders,
      exports: ConfigModule.sharedProviders,
    };
  }
}
