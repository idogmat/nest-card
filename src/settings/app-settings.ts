import { config } from 'dotenv';

config();

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
    // Database
    this.MONGO_CONNECTION_URI =
      envVariables.MONGO_CONNECTION_URI ?? 'mongodb://localhost/nest';
    this.MONGO_CONNECTION_URI_FOR_TESTS =
      envVariables.MONGO_CONNECTION_URI_FOR_TESTS ?? 'mongodb://localhost/test';
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
