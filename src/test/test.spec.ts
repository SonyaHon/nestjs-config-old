import { INestApplication } from '@nestjs/common';
import { Config } from '../lib/decorators/config';
import { EnvVar } from '../lib/decorators/env-var';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '../lib/config.module';
import {
  getConfigToken,
  getConfigValueToken,
} from '../lib/utl/provider-naming';
import {
  AnyNumber,
  Boolean,
  Email,
  Integer,
  JavaScriptDate,
  String,
} from '../lib/decorators/prop-validators';
import {
  createPropValidator,
  createRegExpPropValidator,
} from '../lib/decorators/prop-validator';

describe('Config module test', () => {
  let app: INestApplication;

  const createApp = async (configClass: any, configString) => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot([configClass], {
          defineGlobal: true,
          useString: configString,
        }),
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  };

  it('No Prefix', async () => {
    @Config()
    class DemoConfig {
      @EnvVar('SOME_VAR')
      public someVar!: string;
    }

    await createApp(DemoConfig, `SOME_VAR=asd`);

    const config: DemoConfig = app.get(getConfigToken(DemoConfig));

    expect(config.someVar).toBe('asd');
  });

  it('With prefix', async () => {
    @Config('PREFIX')
    class DemoConfig {
      @EnvVar('SOME_VAR')
      public someVar!: string;
    }

    await createApp(DemoConfig, `SOME_VAR=a\nPREFIX__SOME_VAR=b`);

    const config: DemoConfig = app.get(getConfigToken(DemoConfig));

    expect(config.someVar).toBe('b');
  });

  it('By value', async () => {
    @Config('PREFIX')
    class DemoConfig {
      @EnvVar('SOME_VAR')
      public someVar!: string;
    }

    await createApp(DemoConfig, `SOME_VAR=a\nPREFIX__SOME_VAR=b`);

    const someVar: DemoConfig = app.get(
      getConfigValueToken(DemoConfig, 'someVar'),
    );

    expect(someVar).toBe('b');
  });

  it('Custom prop validator', async () => {
    const CustomValidator = createPropValidator((key, value) => {
      return value;
    });

    @Config()
    class DemoConfig {
      @EnvVar('SOME_VAR')
      @CustomValidator()
      public someVar!: string;
    }

    await createApp(DemoConfig, `SOME_VAR=asd`);

    const config: DemoConfig = app.get(getConfigToken(DemoConfig));

    expect(config.someVar).toBe('asd');
  });

  it('Custom RegExp prop validator', async () => {
    const CustomValidator = createRegExpPropValidator(/asd/);

    @Config()
    class DemoConfig {
      @EnvVar('SOME_VAR')
      @CustomValidator()
      public someVar!: string;
    }

    await createApp(DemoConfig, `SOME_VAR=asd`);

    const config: DemoConfig = app.get(getConfigToken(DemoConfig));

    expect(config.someVar).toBe('asd');
  });

  describe('Integer', () => {
    it('Integer', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('INT')
        @Integer()
        public int!: number;
      }

      await createApp(DemoConfig, `INT=9999`);
      const config: DemoConfig = app.get(getConfigToken(DemoConfig));
      expect(config.int).toBe(9999);
    });

    it('Integer with constraints', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('INT')
        @Integer({ from: 10, to: 20 })
        public int!: number;
      }

      await createApp(DemoConfig, `INT=14`);
      const config: DemoConfig = app.get(getConfigToken(DemoConfig));
      expect(config.int).toBe(14);
    });

    it('Integer as not integer', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('INT')
        @Integer()
        public int!: number;
      }

      await expect(async () => {
        await createApp(DemoConfig, `INT=asd`);
      }).rejects;
    });

    it('Integer outside borders', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('INT')
        @Integer({ from: 10, to: 20 })
        public int!: number;
      }

      await expect(async () => {
        await createApp(DemoConfig, `INT=123`);
      }).rejects;
    });

    it('Integer as float', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('INT')
        @Integer({ from: 10, to: 20 })
        public int!: number;
      }

      await expect(async () => {
        await createApp(DemoConfig, `INT=123.25`);
      }).rejects;
    });

    it('Integer not defined', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('INT')
        @Integer({ from: 10, to: 20 })
        public int!: number;
      }

      await expect(async () => {
        await createApp(DemoConfig, '');
      }).rejects;
    });
  });

  describe('String', () => {
    it('String', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('STR')
        @String()
        public str!: string;
      }

      await createApp(DemoConfig, `STR=asd`);
      const config: DemoConfig = app.get(getConfigToken(DemoConfig));
      expect(config.str).toBe('asd');
    });

    it('String with defined length', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('STR')
        @String({ withLength: 3 })
        public str!: string;
      }

      await createApp(DemoConfig, `STR=asd`);
      const config: DemoConfig = app.get(getConfigToken(DemoConfig));
      expect(config.str).toBe('asd');
    });

    it('String with defined range', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('STR')
        @String({ from: 2, to: 5 })
        public str!: string;
      }

      await createApp(DemoConfig, `STR=asd`);
      const config: DemoConfig = app.get(getConfigToken(DemoConfig));
      expect(config.str).toBe('asd');
    });

    it('String non defined', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('STR')
        @String()
        public str!: string;
      }

      await expect(async () => {
        await createApp(DemoConfig, '');
      }).rejects;
    });

    it('String with wrong length', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('STR')
        @String({ withLength: 3 })
        public str!: string;
      }

      await expect(async () => {
        await createApp(DemoConfig, 'STR=asde');
      }).rejects;
    });

    it('String with wrong range', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('STR')
        @String({ from: 5, to: 12 })
        public str!: string;
      }

      await expect(async () => {
        await createApp(DemoConfig, 'STR=asde');
      }).rejects;
    });
  });

  describe('AnyNumber', () => {
    it('AnyNumber', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('NUM')
        @AnyNumber()
        public num!: number;
      }

      await createApp(DemoConfig, `NUM=99.123`);
      const config: DemoConfig = app.get(getConfigToken(DemoConfig));
      expect(config.num).toBe(99.123);
    });

    it('AnyNumber with range', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('NUM')
        @AnyNumber({ from: 10, to: 100 })
        public num!: number;
      }

      await createApp(DemoConfig, `NUM=99.123`);
      const config: DemoConfig = app.get(getConfigToken(DemoConfig));
      expect(config.num).toBe(99.123);
    });

    it('AnyNumber as not number', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('NUM')
        @AnyNumber({ from: 10, to: 100 })
        public num!: number;
      }

      await expect(async () => {
        await createApp(DemoConfig, `NUM=asd`);
      }).rejects;
    });

    it('AnyNumber as undefined', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('NUM')
        @AnyNumber({ from: 10, to: 100 })
        public num!: number;
      }

      await expect(async () => {
        await createApp(DemoConfig, '');
      }).rejects;
    });

    it('AnyNumber with wrong range', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('NUM')
        @AnyNumber({ from: 10, to: 100 })
        public num!: number;
      }

      await expect(async () => {
        await createApp(DemoConfig, 'NUM=100.1');
      }).rejects;
    });
  });

  describe('Email', () => {
    it('Email', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('EMAIL')
        @Email()
        public email!: string;
      }

      await createApp(DemoConfig, 'EMAIL=email@domain.sub');
      const config: DemoConfig = app.get(getConfigToken(DemoConfig));
      expect(config.email).toBe('email@domain.sub');
    });

    it('Email not valid', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('EMAIL')
        @Email()
        public email!: string;
      }

      await expect(async () => {
        await createApp(DemoConfig, 'EMAIL=emaildomain.sub');
      }).rejects;
    });

    it('Email not defined', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('EMAIL')
        @Email()
        public email!: string;
      }

      await expect(async () => {
        await createApp(DemoConfig, '');
      }).rejects;
    });
  });

  describe('Boolean', () => {
    it('Boolean True', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('BOOL')
        @Boolean()
        public bool!: boolean;
      }

      await createApp(DemoConfig, 'BOOL=true');
      const config: DemoConfig = app.get(getConfigToken(DemoConfig));
      expect(config.bool).toBe(true);
    });

    it('Boolean False', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('BOOL')
        @Boolean()
        public bool!: boolean;
      }

      await createApp(DemoConfig, 'BOOL=false');
      const config: DemoConfig = app.get(getConfigToken(DemoConfig));
      expect(config.bool).toBe(false);
    });

    it('Boolean non defined', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('BOOL')
        @Boolean()
        public bool!: boolean;
      }

      await expect(async () => {
        await createApp(DemoConfig, '');
      }).rejects;
    });

    it('Boolean with non true/false string', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('BOOL')
        @Boolean()
        public bool!: boolean;
      }

      await expect(async () => {
        await createApp(DemoConfig, 'BOOL=asd');
      }).rejects;
    });
  });

  describe('Date', () => {
    it('Date', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('DATE')
        @JavaScriptDate()
        public date!: boolean;
      }

      await createApp(DemoConfig, 'DATE=12.07.2021');
      const config: DemoConfig = app.get(getConfigToken(DemoConfig));
      expect(config.date).toBeInstanceOf(Date);
      expect(config.date).toEqual(new Date('12.07.2021'));
    });

    it('Date with wrong params', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('DATE')
        @JavaScriptDate()
        public date!: boolean;
      }

      await expect(async () => {
        await createApp(DemoConfig, 'DATE=12.07.1020200202');
      }).rejects;
    });

    it('Date as undefined', async () => {
      @Config()
      class DemoConfig {
        @EnvVar('DATE')
        @JavaScriptDate()
        public date!: boolean;
      }

      await expect(async () => {
        await createApp(DemoConfig, '');
      }).rejects;
    });
  });
});
