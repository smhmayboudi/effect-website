import {Console, Effect, Layer, Logger, ManagedRuntime, Runtime} from 'effect';

const program = Effect.log('Application started!');
Effect.runSync(program);
/*
Output:
... level=INFO fiber=#0 message="Application started!"
*/
Runtime.runSync(Runtime.defaultRuntime)(program);
/*
Output:
... level=INFO fiber=#0 message="Application started!"
*/

// Define a configuration layer
const addSimpleLogger = Logger.replace(
  Logger.defaultLogger,
  Logger.make(({message}) => console.log(message))
);

const program2 = Effect.gen(function* () {
  yield* Effect.log('Application started!');
  yield* Effect.log('Application is about to exit!');
});

Effect.runSync(program2);
/*
Output:
timestamp=... level=INFO fiber=#0 message="Application started!"
timestamp=... level=INFO fiber=#0 message="Application is about to exit!"
*/

// Overriding the default logger
Effect.runSync(program2.pipe(Effect.provide(addSimpleLogger)));
/*
Output:
Application started!
Application is about to exit!
*/

// Define a configuration layer
const addSimpleLogger3 = Logger.replace(
  Logger.defaultLogger,
  Logger.make(({message}) => console.log(message))
);

const program3 = Effect.gen(function* () {
  yield* Effect.log('Application started!');
  yield* Effect.gen(function* () {
    yield* Effect.log("I'm not going to be logged!");
    yield* Effect.log('I will be logged by the simple logger.').pipe(
      Effect.provide(addSimpleLogger3)
    );
    yield* Effect.log(
      "Reset back to the previous configuration, so I won't be logged."
    );
  }).pipe(Effect.provide(Logger.remove(Logger.defaultLogger)));
  yield* Effect.log('Application is about to exit!');
});

Effect.runSync(program3);
/*
Output:
timestamp=... level=INFO fiber=#0 message="Application started!"
I will be logged by the simple logger.
timestamp=... level=INFO fiber=#0 message="Application is about to exit!"
*/

// Define a configuration layer
const appLayer = Logger.replace(
  Logger.defaultLogger,
  Logger.make(({message}) => console.log(message))
);

// Transform the configuration layer into a runtime
const runtime = ManagedRuntime.make(appLayer);

const program4 = Effect.log('Application started!');

// Execute the program using the custom runtime
runtime.runSync(program4);

// Cleaning up any resources used by the configuration layer
Effect.runFork(runtime.disposeEffect);
/*
Output:
Application started!
*/

class Notifications extends Effect.Tag('Notifications')<
  Notifications,
  {readonly notify: (message: string) => Effect.Effect<void>}
>() {}
const action = Notifications.notify('Hello, world!');

class Notifications2 extends Effect.Tag('Notifications')<
  Notifications2,
  {readonly notify: (message: string) => Effect.Effect<void>}
>() {
  static Live = Layer.succeed(this, {
    notify: message => Console.log(message),
  });
}

// Example entry point for an external framework
async function main() {
  const runtime = ManagedRuntime.make(Notifications2.Live);
  await runtime.runPromise(Notifications.notify('Hello, world!'));
  await runtime.dispose();
}
