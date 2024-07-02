import {Console, Effect, Fiber} from 'effect';

const fib = (n: number): Effect.Effect<number> =>
  Effect.suspend(() => {
    if (n <= 1) {
      return Effect.succeed(n);
    }
    return fib(n - 1).pipe(Effect.zipWith(fib(n - 2), (a, b) => a + b));
  });
const fib10Fiber = Effect.fork(fib(10));

const program = Effect.gen(function* () {
  const fiber = yield* fib10Fiber;
  const n = yield* Fiber.join(fiber);
  console.log(n);
});
Effect.runPromise(program);
/*
55
*/

const program2 = Effect.gen(function* () {
  const fiber = yield* fib10Fiber;
  const exit = yield* Fiber.await(fiber);
  console.log(exit);
});
Effect.runPromise(program2); // { _id: 'Exit', _tag: 'Success', value: 55 }
/*
{
  _id: "Exit",
  _tag: "Success",
  value: 55,
}
*/

const program3 = Effect.gen(function* () {
  const fiber = yield* Effect.fork(Effect.forever(Effect.succeed('Hi!')));
  const exit = yield* Fiber.interrupt(fiber);
  console.log(exit);
});
Effect.runPromise(program3);
/*
Output
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: {
    _id: 'Cause',
    _tag: 'Interrupt',
    fiberId: {
      _id: 'FiberId',
      _tag: 'Runtime',
      id: 0,
      startTimeMillis: 1715787137490
    }
  }
}
*/

const program4 = Effect.gen(function* () {
  const fiber = yield* Effect.fork(Effect.forever(Effect.succeed('Hi!')));
  const _ = yield* Effect.fork(Fiber.interrupt(fiber));
});

const program5 = Effect.gen(function* () {
  const fiber = yield* Effect.fork(Effect.forever(Effect.succeed('Hi!')));
  const _ = yield* Fiber.interruptFork(fiber);
});

const program6 = Effect.gen(function* () {
  const fiber1 = yield* Effect.fork(Effect.succeed('Hi!'));
  const fiber2 = yield* Effect.fork(Effect.succeed('Bye!'));
  const fiber = Fiber.zip(fiber1, fiber2);
  const tuple = yield* Fiber.join(fiber);
  console.log(tuple);
});
Effect.runPromise(program6);
/*
Output:
[ 'Hi!', 'Bye!' ]
*/

const program7 = Effect.gen(function* () {
  const fiber1 = yield* Effect.fork(Effect.fail('Uh oh!'));
  const fiber2 = yield* Effect.fork(Effect.succeed('Hurray!'));
  const fiber = Fiber.orElse(fiber1, fiber2);
  const message = yield* Fiber.join(fiber);
  console.log(message);
});
Effect.runPromise(program7);
/*
Output:
Hurray!
*/

const task81 = Effect.delay(Console.log('task81'), '1 second');
const task82 = Effect.delay(Console.log('task82'), '2 seconds');
const program8 = Effect.zip(task81, task82);
Effect.runPromise(Effect.timed(program8)).then(([duration]) =>
  console.log(String(duration))
);
/*
Output:
task1
task2
Duration(3s 5ms 369875ns)
*/

const task91 = Effect.delay(Console.log('task91'), '1 second');
const task92 = Effect.delay(Console.log('task92'), '2 seconds');
const program9 = Effect.zip(task91, task92, {concurrent: true});
Effect.runPromise(Effect.timed(program9)).then(([duration]) =>
  console.log(String(duration))
);
/*
Output:
task1
task2
Duration(2s 8ms 179666ns)
*/

const task101 = Effect.delay(Effect.fail('task101'), '1 second');
const task102 = Effect.delay(Effect.succeed('task102'), '2 seconds');
const program10 = Effect.race(task101, task102);
Effect.runPromise(program10).then(console.log);
/*
Output:
task2
*/

const task111 = Effect.delay(Effect.fail('task111'), '1 second');
const task122 = Effect.delay(Effect.succeed('task122'), '2 seconds');
const program12 = Effect.race(Effect.either(task111), Effect.either(task122));
Effect.runPromise(program12).then(console.log);
/*
Output:
{ _id: 'Either', _tag: 'Left', left: 'task1' }
*/

const task13 = Effect.delay(Effect.succeed('task13'), '10 seconds');
const program13 = Effect.timeout(task13, '2 seconds');
Effect.runPromise(program13);
/*
throws:
TimeoutException
*/
