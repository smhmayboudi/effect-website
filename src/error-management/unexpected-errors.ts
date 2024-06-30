import {Cause, Console, Effect, Option} from 'effect';
const divide = (a: number, b: number): Effect.Effect<number> =>
  b === 0
    ? Effect.die(new Error('Cannot divide by zero'))
    : Effect.succeed(a / b);
Effect.runSync(divide(1, 0)); // throws Error: Cannot divide by zero

const divide2 = (a: number, b: number): Effect.Effect<number> =>
  b === 0 ? Effect.dieMessage('Cannot divide by2 zero') : Effect.succeed(a / b);

Effect.runSync(divide2(1, 0)); // throws RuntimeException: Cannot divide by zero

const divide3 = (a: number, b: number): Effect.Effect<number, Error> =>
  b === 0
    ? Effect.fail(new Error('Cannot divide by zero'))
    : Effect.succeed(a / b);

const program = Effect.orDie(divide3(1, 0));

Effect.runSync(program); // throws Error: Cannot divide by zero

const divide4 = (a: number, b: number): Effect.Effect<number, Error> =>
  b === 0
    ? Effect.fail(new Error('Cannot divide by zero'))
    : Effect.succeed(a / b);

const program2 = Effect.orDieWith(
  divide4(1, 0),
  error => new Error(`defect: ${error.message}`)
);

Effect.runSync(program); // throws Error: defect: Cannot divide by zero

const program3 = Effect.catchAllDefect(
  Effect.dieMessage('Boom!'), // Simulating a runtime error
  defect => {
    if (Cause.isRuntimeException(defect)) {
      return Console.log(`RuntimeException defect caught: ${defect.message}`);
    }
    return Console.log('Unknown defect caught.');
  }
);

// We get an Exit.Success because we caught all defects
Effect.runPromiseExit(program).then(console.log);
/*
Output:
RuntimeException defect caught: Boom!
{
  _id: "Exit",
  _tag: "Success",
  value: undefined
}
*/

const program4 = Effect.catchSomeDefect(
  Effect.dieMessage('Boom!'), // Simulating a runtime error
  defect => {
    if (Cause.isIllegalArgumentException(defect)) {
      return Option.some(
        Console.log(
          `Caught an IllegalArgumentException defect: ${defect.message}`
        )
      );
    }
    return Option.none();
  }
);

// Since we are only catching IllegalArgumentException
// we will get an Exit.Failure because we simulated a runtime error.
Effect.runPromiseExit(program4).then(console.log);
/*
Output:
{
  _id: "Exit",
  _tag: "Failure",
  cause: {
    _id: "Cause",
    _tag: "Die",
    defect: {
      _tag: "RuntimeException",
      message: "Boom!",
      [Symbol(@effect/io/Cause/errors/RuntimeException)]: Symbol(@effect/io/Cause/errors/RuntimeException),
      toString: [Function: toString]
    }
  }
}
*/
