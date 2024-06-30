import {Effect, Context, Option} from 'effect';

class Random extends Context.Tag('MyRandomService')<
  Random,
  {readonly next: Effect.Effect<number>}
>() {}

const program = Effect.gen(function* () {
  const random = yield* Random;
  const randomNumber = yield* random.next;
  console.log(`random number: ${randomNumber}`);
});

const runnable = Effect.provideService(program, Random, {
  next: Effect.sync(() => Math.random()),
});

Effect.runPromise(runnable);
/*
Output:
random number: 0.8241872233134417
*/

// Create a tag for the 'Random' service
class Random extends Context.Tag('MyRandomService')<
  Random,
  {
    readonly next: Effect.Effect<number>;
  }
>() {}

// Create a tag for the 'Logger' service
class Logger extends Context.Tag('MyLoggerService')<
  Logger,
  {
    readonly log: (message: string) => Effect.Effect<void>;
  }
>() {}

const program2 = Effect.gen(function* () {
  // Acquire instances of the 'Random' and 'Logger' services
  const random = yield* Random;
  const logger = yield* Logger;

  // Generate a random number using the 'Random' service
  const randomNumber = yield* random.next;

  // Log the random number using the 'Logger' service
  return yield* logger.log(String(randomNumber));
});

// Provide service implementations for 'Random' and 'Logger'
const runnable1 = program.pipe(
  Effect.provideService(Random, {
    next: Effect.sync(() => Math.random()),
  }),
  Effect.provideService(Logger, {
    log: message => Effect.sync(() => console.log(message)),
  })
);

// Combine service implementations into a single 'Context'
const context = Context.empty().pipe(
  Context.add(Random, {next: Effect.sync(() => Math.random())}),
  Context.add(Logger, {
    log: message => Effect.sync(() => console.log(message)),
  })
);
// Provide the entire context to the 'program'
const runnable2 = Effect.provide(program, context);

class Random2 extends Context.Tag('MyRandomService')<
  Random2,
  {readonly next: Effect.Effect<number>}
>() {}

const program3 = Effect.gen(function* () {
  const maybeRandom = yield* Effect.serviceOption(Random2);
  const randomNumber = Option.isNone(maybeRandom)
    ? // the service is not available, return a default value
      -1
    : // the service is available
      yield* maybeRandom.value.next;
  console.log(randomNumber);
});

Effect.runPromise(
  Effect.provideService(program, Random, {
    next: Effect.sync(() => Math.random()),
  })
).then(console.log);
// Output: 0.9957979486841035
