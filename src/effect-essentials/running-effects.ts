import {Console, Effect, Fiber, Schedule} from 'effect';
const program = Effect.sync(() => {
  console.log('Hello, World!');
  return 1;
});
const result = Effect.runSync(program);
// Output: Hello, World!
console.log(result);
// Output: 1

Effect.runSync(Effect.fail('my error')); // throws

Effect.runSync(Effect.promise(() => Promise.resolve(1))); // throws

const result1 = Effect.runSyncExit(Effect.succeed(1));
console.log(result1);
/*
Output:
{
  _id: "Exit",
  _tag: "Success",
  value: 1
}
*/

const result2 = Effect.runSyncExit(Effect.fail('my error'));
console.log(result2);
/*
Output:
{
  _id: "Exit",
  _tag: "Failure",
  cause: {
    _id: "Cause",
    _tag: "Fail",
    failure: "my error"
  }
}
*/

Effect.runSyncExit(Effect.promise(() => Promise.resolve(1))); // throws

Effect.runPromise(Effect.succeed(1)).then(console.log); // Output: 1

Effect.runPromise(Effect.fail('my error')); // rejects

Effect.runPromiseExit(Effect.succeed(1)).then(console.log);
/*
Output:
{
  _id: "Exit",
  _tag: "Success",
  value: 1
}
*/

Effect.runPromiseExit(Effect.fail('my error')).then(console.log);
/*
Output:
{
  _id: "Exit",
  _tag: "Failure",
  cause: {
    _id: "Cause",
    _tag: "Fail",
    failure: "my error"
  }
}
*/

const program2 = Effect.repeat(
  Console.log('running...'),
  Schedule.spaced('200 millis')
);

const fiber = Effect.runFork(program2);

setTimeout(() => {
  Effect.runFork(Fiber.interrupt(fiber));
}, 500);
