import {Cause, Console, Effect, Either, Random, pipe} from 'effect';

const simulatedTask = Effect.fail('Oh no!').pipe(Effect.as(1));
const mapped = Effect.mapError(simulatedTask, message => new Error(message));

const simulatedTask2 = Effect.fail('Oh no!').pipe(Effect.as(1));

const modified = Effect.mapBoth(simulatedTask2, {
  onFailure: message => new Error(message),
  onSuccess: n => n > 0,
});

const task1 = Effect.filterOrFail(
  Random.nextRange(-1, 1),
  n => n >= 0,
  () => 'random number is negative'
);

const task2 = Effect.filterOrDie(
  Random.nextRange(-1, 1),
  n => n >= 0,
  () => new Cause.IllegalArgumentException('random number is negative')
);

const task3 = Effect.filterOrDieMessage(
  Random.nextRange(-1, 1),
  n => n >= 0,
  'random number is negative'
);

const task4 = Effect.filterOrElse(
  Random.nextRange(-1, 1),
  n => n >= 0,
  () => task3
);

// Define a user interface
interface User {
  readonly name: string;
}

// Assume an asynchronous authentication function
declare const auth: () => Promise<User | null>;

const program = pipe(
  Effect.promise(() => auth()),
  Effect.filterOrFail(
    // Define a guard to narrow down the type
    (user): user is User => user !== null,
    () => new Error('Unauthorized')
  ),
  Effect.andThen(user => user.name) // The 'user' here has type `User`, not `User | null`
);

// Create an effect that is designed to fail, simulating an occurrence of a network error
const task: Effect.Effect<number, string> = Effect.fail('NetworkError');

// Log the error message if the task fails. This function only executes if there is an error,
// providing a method to handle or inspect errors without altering the outcome of the original effect.
const tapping = Effect.tapError(task, error =>
  Console.log(`expected error: ${error}`)
);

Effect.runFork(tapping);
/*
Output:
expected error: NetworkError
*/

class NetworkError {
  readonly _tag = 'NetworkError';
  constructor(readonly statusCode: number) {}
}
class ValidationError {
  readonly _tag = 'ValidationError';
  constructor(readonly field: string) {}
}

// Create an effect that is designed to fail, simulating an occurrence of a network error
const task5: Effect.Effect<number, NetworkError | ValidationError> =
  Effect.fail(new NetworkError(504));

// Apply an error handling function only to errors tagged as "NetworkError",
// and log the corresponding status code of the error.
const tapping5 = Effect.tapErrorTag(task5, 'NetworkError', error =>
  Console.log(`expected error: ${error.statusCode}`)
);

Effect.runFork(tapping5);
/*
Output:
expected error: 504
*/

// Create an effect that is designed to fail, simulating an occurrence of a network error
const task6: Effect.Effect<number, string> = Effect.fail('NetworkError');
// This will log the cause of any expected error or defect
const tapping3 = Effect.tapErrorCause(task6, cause =>
  Console.log(`error cause: ${cause}`)
);
Effect.runFork(tapping3);
/*
Output:
error cause: Error: NetworkError
*/
// Simulate a severe failure in the system by causing a defect with a specific message.
const task7: Effect.Effect<number, string> = Effect.dieMessage(
  'Something went wrong'
);
// This will log the cause of any expected error or defect
const tapping4 = Effect.tapErrorCause(task7, cause =>
  Console.log(`error cause: ${cause}`)
);
Effect.runFork(tapping4);
/*
Output:
error cause: RuntimeException: Something went wrong
  ... stack trace ...
*/

// Create an effect that is designed to fail, simulating an occurrence of a network error
const task8: Effect.Effect<number, string> = Effect.fail('NetworkError');
// this won't log anything because is not a defect
const tapping1 = Effect.tapDefect(task8, cause =>
  Console.log(`defect: ${cause}`)
);
Effect.runFork(tapping1);
/*
No Output
*/
// Simulate a severe failure in the system by causing a defect with a specific message.
const task9: Effect.Effect<number, string> = Effect.dieMessage(
  'Something went wrong'
);
// This will only log defects, not errors
const tapping2 = Effect.tapDefect(task9, cause =>
  Console.log(`defect: ${cause}`)
);
Effect.runFork(tapping2);
/*
Output:
defect: RuntimeException: Something went wrong
  ... stack trace ...
*/

// Simulate an effect that might fail
const task10 = Effect.filterOrFail(
  Random.nextRange(-1, 1),
  n => n >= 0,
  () => 'random number is negative'
);

// Define an effect that logs both success and failure outcomes of the 'task10'
const tapping10 = Effect.tapBoth(task10, {
  onFailure: error => Console.log(`failure: ${error}`),
  onSuccess: randomNumber => Console.log(`random number: ${randomNumber}`),
});

Effect.runFork(tapping10);
/*
Example Output:
failure: random number is negative
*/

const simulatedTask10 = Effect.fail('Oh uh!').pipe(Effect.as(2));

const program10 = Effect.gen(function* () {
  const failureOrSuccess = yield* Effect.either(simulatedTask10);
  if (Either.isLeft(failureOrSuccess)) {
    const error = failureOrSuccess.left;
    yield* Console.log(`failure: ${error}`);
    return 0;
  } else {
    const value = failureOrSuccess.right;
    yield* Console.log(`success: ${value}`);
    return value;
  }
});
