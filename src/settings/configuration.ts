export const Environments = ['DEVELOPMENT', 'STAGING', 'PRODUCTION', 'TESTING'];
export type EnvironmentsTypes =
  | 'DEVELOPMENT'
  | 'STAGING'
  | 'PRODUCTION'
  | 'TESTING';
export const getConfiguration = () => {
  return {
    ENV: (Environments.includes(process.env.ENV?.trim())
      ? process.env.ENV.trim()
      : 'DEVELOPMENT') as EnvironmentsTypes,
    APP_PORT: process.env.APP_PORT,
    HASH_ROUNDS: process.env.HASH_ROUNDS,
    ADMIN_LOGIN: process.env.ADMIN_LOGIN,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ACCESS_SECRET_TOKEN: process.env.ACCESS_SECRET_TOKEN,
    REFRESH_SECRET_TOKEN: process.env.REFRESH_SECRET_TOKEN,
    ACCESS_SECRET_TOKEN_EXPIRATION: process.env.ACCESS_SECRET_TOKEN_EXPIRATION,
    REFRESH_SECRET_TOKEN_EXPIRATION: process.env.REFRESH_SECRET_TOKEN_EXPIRATION,
    THROTTLER_TTL: Number(process.env.THROTTLER_TTL),
    THROTTLER_LIMIT: Number(process.env.THROTTLER_LIMIT),
    MONGO_CONNECTION_URI:
      process.env.MONGO_CONNECTION_URI ?? 'mongodb://localhost/nest',
    MONGO_CONNECTION_URI_FOR_TESTS:
      process.env.MONGO_CONNECTION_URI_FOR_TESTS ?? 'mongodb://localhost/test',
  };
};