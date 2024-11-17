export type EnvironmentVariable = { [key: string]: string | undefined; };
export type EnvironmentsTypes =
  | 'DEVELOPMENT'
  | 'STAGING'
  | 'PRODUCTION'
  | 'TESTING';
export const Environments = ['DEVELOPMENT', 'STAGING', 'PRODUCTION', 'TESTING'];

export class EnvironmentSettings {
  constructor(private env: EnvironmentsTypes) { }

  getEnv() {
    return this.env;
  }

  isProduction() {
    return this.env === 'PRODUCTION';
  }

  isStaging() {
    return this.env === 'STAGING';
  }

  isDevelopment() {
    return this.env === 'DEVELOPMENT';
  }

  isTesting() {
    return this.env === 'TESTING';
  }
}

export class AppSettings {
  constructor(
    public env: EnvironmentSettings,
    public api: APISettings,
  ) { }
}

class APISettings {
  // Application
  public readonly APP_PORT: number;
  public readonly HASH_ROUNDS: number;
  public readonly ADMIN_LOGIN: string;
  public readonly ADMIN_PASSWORD: string;
  public readonly ACCESS_SECRET_TOKEN: string;
  public readonly REFRESH_SECRET_TOKEN: string;
  public readonly ACCESS_SECRET_TOKEN_EXPIRATION: string;
  public readonly REFRESH_SECRET_TOKEN_EXPIRATION: string;
  public readonly THROTTLER_TTL: number;
  public readonly THROTTLER_LIMIT: number;
  public readonly DB: {
    type: string,
    DB_HOST: string,
    DB_PORT: number,
    DB_USER: string,
    DB_PASSWORD: string,
    DB_NAME: string,
    autoLoadEntities: boolean,
    synchronize: boolean,
  };

  // Database
  public readonly MONGO_CONNECTION_URI: string;
  public readonly MONGO_CONNECTION_URI_FOR_TESTS: string;

  constructor(private readonly envVariables: EnvironmentVariable) {
    // Application
    this.APP_PORT = this.getNumberOrDefault(envVariables.APP_PORT, 3003);
    this.HASH_ROUNDS = this.getNumberOrDefault(envVariables.HASH_ROUNDS, 10);
    this.ADMIN_LOGIN = this.envVariables.ADMIN_LOGIN;
    this.ADMIN_PASSWORD = this.envVariables.ADMIN_PASSWORD;
    this.ACCESS_SECRET_TOKEN = this.envVariables.ACCESS_SECRET_TOKEN;
    this.REFRESH_SECRET_TOKEN = this.envVariables.REFRESH_SECRET_TOKEN;
    this.ACCESS_SECRET_TOKEN_EXPIRATION = this.envVariables.ACCESS_SECRET_TOKEN_EXPIRATION;
    this.REFRESH_SECRET_TOKEN_EXPIRATION = this.envVariables.REFRESH_SECRET_TOKEN_EXPIRATION;
    this.THROTTLER_TTL = this.getNumberOrDefault(this.envVariables.THROTTLER_TTL, 10000);
    this.THROTTLER_LIMIT = this.getNumberOrDefault(this.envVariables.THROTTLER_LIMIT, 5);
    // Database
    this.DB = {
      type: 'postgres',
      DB_HOST: process.env.DB_HOST,
      DB_PORT: Number(process.env.DB_PORT),
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_NAME: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    };
  }

  private getNumberOrDefault(value: string, defaultValue: number): number {
    const parsedValue = Number(value);

    if (isNaN(parsedValue)) {
      return defaultValue;
    }

    return parsedValue;
  }
}

const env = new EnvironmentSettings(
  (Environments.includes(process.env.ENV?.trim())
    ? process.env.ENV.trim()
    : 'DEVELOPMENT') as EnvironmentsTypes,
);

const api = new APISettings(process.env);
export const appSettings = new AppSettings(env, api);
