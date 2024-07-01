import {
  Effect,
  Config,
  ConfigProvider,
  Layer,
  Console,
  Redacted,
  Secret,
} from 'effect';

const program = Effect.gen(function* () {
  const host = yield* Config.string('HOST');
  const port = yield* Config.number('PORT');
  console.log(`Application started: ${host}:${port}`);
});
Effect.runSync(program);

const program2 = Effect.gen(function* () {
  const host = yield* Config.string('HOST');
  const port = yield* Config.number('PORT').pipe(Config.withDefault(8080));
  console.log(`Application started: ${host}:${port}`);
});
Effect.runSync(program2);

const program3 = Effect.gen(function* () {
  const config = yield* Config.array(Config.string(), 'MY_ARRAY');
  console.log(config);
});
Effect.runSync(program3);

const program4 = Effect.gen(function* () {
  const config = yield* Config.string('NAME').pipe(
    Config.validate({
      message: 'Expected a string at least 4 characters long',
      validation: s => s.length >= 4,
    })
  );
  console.log(config);
});
Effect.runSync(program4);

// A program that requires two configurations: A and B
const program5 = Effect.gen(function* () {
  const A = yield* Config.string('A');
  const B = yield* Config.string('B');
  console.log(`A: ${A}`, `B: ${B}`);
});
const provider1 = ConfigProvider.fromMap(
  new Map([
    ['A', 'A'],
    // B is missing
  ])
);
const provider2 = ConfigProvider.fromMap(
  new Map([
    // A is missing
    ['B', 'B'],
  ])
);
const layer = Layer.setConfigProvider(
  provider1.pipe(ConfigProvider.orElse(() => provider2))
);
Effect.runSync(Effect.provide(program5, layer));

class HostPort {
  constructor(
    readonly host: string,
    readonly port: number
  ) {}
  get url() {
    return `${this.host}:${this.port}`;
  }
}
const both = Config.all([Config.string('HOST'), Config.number('PORT')]);
const config = Config.map(both, ([host, port]) => new HostPort(host, port));

const program6 = Effect.gen(function* () {
  const hostPort = yield* config;
  console.log(`Application started: ${hostPort.url}`);
});
Effect.runSync(program6);

class ServiceConfig {
  constructor(
    readonly hostPort: HostPort,
    readonly timeout: number
  ) {}
}
const config2 = Config.map(
  Config.all([config, Config.number('TIMEOUT')]),
  ([hostPort, timeout]) => new ServiceConfig(hostPort, timeout)
);

const config3 = Config.map(
  Config.all([Config.nested(config, 'HOSTPORT'), Config.number('TIMEOUT')]),
  ([hostPort, timeout]) => new ServiceConfig(hostPort, timeout)
);

// Create a mock config provider using ConfigProvider.fromMap
const mockConfigProvider = ConfigProvider.fromMap(
  new Map([
    ['HOST', 'localhost'],
    ['PORT', '8080'],
  ])
);

// Create a layer using Layer.setConfigProvider to override the default config provider
const layer2 = Layer.setConfigProvider(mockConfigProvider);

// Run the program using the provided layer
Effect.runSync(Effect.provide(program, layer));
// Output: Application started: localhost:8080

const program7 = Config.redacted('API_KEY').pipe(
  Effect.tap(redacted => Console.log(`Console output: ${redacted}`)),
  Effect.tap(redacted =>
    Console.log(`Actual value: ${Redacted.value(redacted)}`)
  )
);
Effect.runSync(program7);

const program8 = Config.secret('API_KEY').pipe(
  Effect.tap(secret => Console.log(`Console output: ${secret}`)),
  Effect.tap(secret => Console.log(`Secret value: ${Secret.value(secret)}`))
);
Effect.runSync(program8);
