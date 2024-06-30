import {Effect, Context, Layer} from 'effect';
// Create a tag for the Config service
class Config extends Context.Tag('Config')<
  Config,
  {
    readonly getConfig: Effect.Effect<{
      readonly logLevel: string;
      readonly connection: string;
    }>;
  }
>() {}
const ConfigLive = Layer.succeed(
  Config,
  Config.of({
    getConfig: Effect.succeed({
      logLevel: 'INFO',
      connection: 'mysql://username:password@hostname:port/database_name',
    }),
  })
);

const ConfigLive2 = Layer.succeed(Config, {
  getConfig: Effect.succeed({
    logLevel: 'INFO',
    connection: 'mysql://username:password@hostname:port/database_name',
  }),
});

class Logger extends Context.Tag('Logger')<
  Logger,
  {readonly log: (message: string) => Effect.Effect<void>}
>() {}
const LoggerLive2 = Layer.effect(
  Logger,
  Effect.gen(function* () {
    const config = yield* Config;
    return {
      log: message =>
        Effect.gen(function* () {
          const {logLevel} = yield* config.getConfig;
          console.log(`[${logLevel}] ${message}`);
        }),
    };
  })
);

class Database extends Context.Tag('Database')<
  Database,
  {readonly query: (sql: string) => Effect.Effect<unknown>}
>() {}
const DatabaseLive2 = Layer.effect(
  Database,
  Effect.gen(function* () {
    const config = yield* Config;
    const logger = yield* Logger;
    return {
      query: (sql: string) =>
        Effect.gen(function* () {
          yield* logger.log(`Executing query: ${sql}`);
          const {connection} = yield* config.getConfig;
          return {result: `Results from ${connection}`};
        }),
    };
  })
);

const AppConfigLive = Layer.merge(ConfigLive2, LoggerLive2);

const MainLive = DatabaseLive2.pipe(
  // provides the config and logger to the database
  Layer.provide(AppConfigLive),
  // provides the config to AppConfigLive
  Layer.provide(ConfigLive2)
);

const AppConfigLive2 = Layer.merge(ConfigLive2, LoggerLive2);

const MainLive2 = DatabaseLive2.pipe(
  Layer.provide(AppConfigLive2),
  Layer.provideMerge(ConfigLive2)
);

const program = Effect.gen(function* () {
  const database = yield* Database;
  const result = yield* database.query('SELECT * FROM users');
  return yield* Effect.succeed(result);
});
const runnable = Effect.provide(program, MainLive);
Effect.runPromise(runnable).then(console.log);
/*
Output:
[INFO] Executing query: SELECT * FROM users
{
  result: 'Results from mysql://username:password@hostname:port/database_name'
}
*/
