import {Console, Effect, Either, Option} from 'effect';
class HttpError {
  readonly _tag = 'HttpError';
}
const program = Effect.fail(new HttpError());

import {Effect, Random} from 'effect';
export class FooError {
  readonly _tag = 'FooError';
}
export class BarError {
  readonly _tag = 'BarError';
}
export const program2 = Effect.gen(function* () {
  const n1 = yield* Random.next;
  const n2 = yield* Random.next;
  const foo = n1 > 0.5 ? 'yay!' : yield* Effect.fail(new FooError());
  const bar = n2 > 0.5 ? 'yay!' : yield* Effect.fail(new BarError());
  return foo + bar;
});
Effect.runPromise(program2).then(console.log, console.error);

import {Effect, Random} from 'effect';
export class FooError {
  readonly _tag = 'FooError';
}
export class BarError {
  readonly _tag = 'BarError';
}
const flakyFoo = Random.next.pipe(
  Effect.andThen(n1 =>
    n1 > 0.5 ? Effect.succeed('yay!') : Effect.fail(new FooError())
  )
);
const flakyBar = Random.next.pipe(
  Effect.andThen(n2 =>
    n2 > 0.5 ? Effect.succeed('yay!') : Effect.fail(new BarError())
  )
);
export const program3 = Effect.all([flakyFoo, flakyBar]).pipe(
  Effect.andThen(([foo, bar]) => foo + bar)
);

// Define three effects representing different tasks.
const task1 = Console.log('Executing task1...');
const task2 = Effect.fail('Something went wrong!');
const task3 = Console.log('Executing task3...');
// Compose the three tasks to run them in sequence.
// If one of the tasks fails, the subsequent tasks won't be executed.
const program4 = Effect.gen(function* () {
  yield* task1;
  yield* task2; // After task1, task2 is executed, but it fails with an error
  yield* task3; // This computation won't be executed because the previous one fails
});
Effect.runPromiseExit(program4).then(console.log);
/*
Output:
Executing task1...
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Fail', failure: 'Something went wrong!' }
}
*/

// Define three effects representing different tasks.
const task12 = Console.log('Executing task1...');
const task22 = Effect.fail('Something went wrong!');
const task32 = Console.log('Executing task3...');
// Compose the three tasks using `Effect.andThen` to run them in sequence.
// The `Effect.andThen` function allows us to chain effects together.
// If one of the tasks fails, the subsequent tasks won't be executed.
const program5 = task12.pipe(
  Effect.andThen(task22), // After task1, task2 is executed, but it fails with an error
  Effect.andThen(task32) // This computation won't be executed because the previous one fails
);
Effect.runPromiseExit(program5).then(console.log);
/*
Output:
Executing task1...
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Fail', failure: 'Something went wrong!' }
}
*/

const recovered = Effect.gen(function* () {
  const failureOrSuccess = yield* Effect.either(program);
  if (Either.isLeft(failureOrSuccess)) {
    // failure case: you can extract the error from the `left` property
    const error = failureOrSuccess.left;
    return `Recovering from ${error._tag}`;
  } else {
    // success case: you can extract the value from the `right` property
    return failureOrSuccess.right;
  }
});

const recovered2 = Effect.gen(function* () {
  const failureOrSuccess = yield* Effect.either(program);
  return Either.match(failureOrSuccess, {
    onLeft: error => `Recovering from ${error._tag}`,
    onRight: value => value, // do nothing in case of success
  });
});

const recovered3 = program.pipe(
  Effect.catchAll(error => Effect.succeed(`Recovering from ${error._tag}`))
);

const recovered4 = Effect.gen(function* () {
  const failureOrSuccess = yield* Effect.either(program3);
  if (Either.isLeft(failureOrSuccess)) {
    const error = failureOrSuccess.left;
    if (error._tag === 'FooError') {
      return 'Recovering from FooError';
    }
    return yield* Effect.fail(error);
  } else {
    return failureOrSuccess.right;
  }
});

const recovered5 = Effect.gen(function* () {
  const failureOrSuccess = yield* Effect.either(program3);
  if (Either.isLeft(failureOrSuccess)) {
    const error = failureOrSuccess.left;
    if (error._tag === 'FooError') {
      return 'Recovering from FooError';
    } else {
      return 'Recovering from BarError';
    }
  } else {
    return failureOrSuccess.right;
  }
});

const recovered6 = program3.pipe(
  Effect.catchSome(error => {
    if (error._tag === 'FooError') {
      return Option.some(Effect.succeed('Recovering from FooError'));
    }
    return Option.none();
  })
);

const recovered7 = program3.pipe(
  Effect.catchIf(
    error => error._tag === 'FooError',
    () => Effect.succeed('Recovering from FooError')
  )
);

const recovered8 = program3.pipe(
  Effect.catchIf(
    (error): error is FooError => error._tag === 'FooError',
    () => Effect.succeed('Recovering from FooError')
  )
);

const recovered9 = program3.pipe(
  Effect.catchTag('FooError', _fooError =>
    Effect.succeed('Recovering from FooError')
  )
);

const recovered10 = program3.pipe(
  Effect.catchTag('FooError', _fooError =>
    Effect.succeed('Recovering from FooError')
  ),
  Effect.catchTag('BarError', _barError =>
    Effect.succeed('Recovering from BarError')
  )
);

const recovered11 = program3.pipe(
  Effect.catchTags({
    FooError: _fooError => Effect.succeed(`Recovering from FooError`),
    BarError: _barError => Effect.succeed(`Recovering from BarError`),
  })
);
