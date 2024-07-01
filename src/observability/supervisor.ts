import {Effect, Supervisor, Schedule, Fiber, FiberStatus} from 'effect';

const program = Effect.gen(function* () {
  const supervisor = yield* Supervisor.track;
  const fibFiber = yield* fib(20).pipe(
    Effect.supervised(supervisor),
    Effect.fork
  );
  const policy = Schedule.spaced('500 millis').pipe(
    Schedule.whileInputEffect(_ =>
      Fiber.status(fibFiber).pipe(
        Effect.andThen(status => status !== FiberStatus.done)
      )
    )
  );
  const monitorFiber = yield* monitorFibers(supervisor).pipe(
    Effect.repeat(policy),
    Effect.fork
  );
  yield* Fiber.join(monitorFiber);
  const result = yield* Fiber.join(fibFiber);
  console.log(`fibonacci result: ${result}`);
});
const monitorFibers = (
  supervisor: Supervisor.Supervisor<Array<Fiber.RuntimeFiber<any, any>>>
): Effect.Effect<void> =>
  Effect.gen(function* () {
    const fibers = yield* supervisor.value;
    console.log(`number of fibers: ${fibers.length}`);
  });
const fib = (n: number): Effect.Effect<number> =>
  Effect.gen(function* ($) {
    if (n <= 1) {
      return 1;
    }
    yield* Effect.sleep('500 millis');
    const fiber1 = yield* Effect.fork(fib(n - 2));
    const fiber2 = yield* Effect.fork(fib(n - 1));
    const v1 = yield* $(Fiber.join(fiber1));
    const v2 = yield* $(Fiber.join(fiber2));
    return v1 + v2;
  });
Effect.runPromise(program);
/*
Output:
number of fibers: 0
number of fibers: 2
number of fibers: 6
number of fibers: 14
number of fibers: 30
number of fibers: 62
number of fibers: 126
number of fibers: 254
number of fibers: 510
number of fibers: 1022
number of fibers: 2034
number of fibers: 3795
number of fibers: 5810
number of fibers: 6474
number of fibers: 4942
number of fibers: 2515
number of fibers: 832
number of fibers: 170
number of fibers: 18
number of fibers: 0
fibonacci result: 10946
*/
