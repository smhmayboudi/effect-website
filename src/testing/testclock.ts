import {
  Effect,
  TestClock,
  Fiber,
  Option,
  TestContext,
  pipe,
  Queue,
  Clock,
  Deferred,
} from 'effect';
import * as assert from 'node:assert';

const test = Effect.gen(function* () {
  // Create a fiber that sleeps for 5 minutes and then times out after 1 minute
  const fiber = yield* Effect.sleep('5 minutes').pipe(
    Effect.timeoutTo({
      duration: '1 minute',
      onSuccess: Option.some,
      onTimeout: () => Option.none<void>(),
    }),
    Effect.fork
  );
  // Adjust the TestClock by 1 minute to simulate the passage of time
  yield* TestClock.adjust('1 minute');
  // Get the result of the fiber
  const result = yield* Fiber.join(fiber);
  // Check if the result is None, indicating a timeout
  assert.ok(Option.isNone(result));
}).pipe(Effect.provide(TestContext.TestContext));
Effect.runPromise(test);

const test2 = pipe(
  Effect.sleep('5 minutes'),
  Effect.timeoutTo({
    duration: '1 minute',
    onSuccess: Option.some,
    onTimeout: () => Option.none<void>(),
  }),
  Effect.fork,
  Effect.tap(() =>
    // Adjust the TestClock by 1 minute to simulate the passage of time
    TestClock.adjust('1 minute')
  ),
  Effect.andThen(fiber =>
    // Get the result of the fiber
    Fiber.join(fiber)
  ),
  Effect.andThen(result => {
    // Check if the result is None, indicating a timeout
    assert.ok(Option.isNone(result));
  }),
  Effect.provide(TestContext.TestContext)
);
Effect.runPromise(test2);

const test3 = Effect.gen(function* () {
  const q = yield* Queue.unbounded();
  yield* Queue.offer(q, undefined).pipe(
    // Delay the effect for 60 minutes and repeat it forever
    Effect.delay('60 minutes'),
    Effect.forever,
    Effect.fork
  );
  // Check if no effect is performed before the recurrence period
  const a = yield* Queue.poll(q).pipe(Effect.andThen(Option.isNone));
  // Adjust the TestClock by 60 minutes to simulate the passage of time
  yield* TestClock.adjust('60 minutes');
  // Check if an effect is performed after the recurrence period
  const b = yield* Queue.take(q).pipe(Effect.as(true));
  // Check if the effect is performed exactly once
  const c = yield* Queue.poll(q).pipe(Effect.andThen(Option.isNone));
  // Adjust the TestClock by another 60 minutes
  yield* TestClock.adjust('60 minutes');
  // Check if another effect is performed
  const d = yield* Queue.take(q).pipe(Effect.as(true));
  const e = yield* Queue.poll(q).pipe(Effect.andThen(Option.isNone));
  // Ensure that all conditions are met
  assert.ok(a && b && c && d && e);
}).pipe(Effect.provide(TestContext.TestContext));
Effect.runPromise(test3);

const test4 = pipe(
  Queue.unbounded(),
  Effect.andThen(q =>
    pipe(
      Queue.offer(q, undefined),
      // Delay the effect for 60 minutes and repeat it forever
      Effect.delay('60 minutes'),
      Effect.forever,
      Effect.fork,
      Effect.andThen(
        pipe(
          Effect.Do,
          // Check if no effect is performed before the recurrence period
          Effect.bind('a', () =>
            pipe(Queue.poll(q), Effect.andThen(Option.isNone))
          ),
          // Adjust the TestClock by 60 minutes to simulate the passage of time
          Effect.tap(() => TestClock.adjust('60 minutes')),
          // Check if an effect is performed after the recurrence period
          Effect.bind('b', () => pipe(Queue.take(q), Effect.as(true))),
          // Check if the effect is performed exactly once
          Effect.bind('c', () =>
            pipe(Queue.poll(q), Effect.andThen(Option.isNone))
          ),
          // Adjust the TestClock by another 60 minutes
          Effect.tap(() => TestClock.adjust('60 minutes')),
          // Check if another effect is performed
          Effect.bind('d', () => pipe(Queue.take(q), Effect.as(true))),
          Effect.bind('e', () =>
            pipe(Queue.poll(q), Effect.andThen(Option.isNone))
          )
        )
      ),
      Effect.andThen(({a, b, c, d, e}) => {
        // Ensure that all conditions are met
        assert.ok(a && b && c && d && e);
      })
    )
  ),
  Effect.provide(TestContext.TestContext)
);
Effect.runPromise(test4);

const test5 = Effect.gen(function* () {
  // Get the current time using the Clock
  const startTime = yield* Clock.currentTimeMillis;
  // Adjust the TestClock by 1 minute to simulate the passage of time
  yield* TestClock.adjust('1 minute');
  // Get the current time again
  const endTime = yield* Clock.currentTimeMillis;
  // Check if the time difference is at least 60,000 milliseconds (1 minute)
  assert.ok(endTime - startTime >= 60_000);
}).pipe(Effect.provide(TestContext.TestContext));
Effect.runPromise(test5);

const test6 = Effect.gen(function* () {
  // Create a deferred value
  const deferred = yield* Deferred.make<number, void>();
  // Run two effects concurrently: sleep for 10 seconds and succeed the deferred with a value of 1
  yield* Effect.all(
    [Effect.sleep('10 seconds'), Deferred.succeed(deferred, 1)],
    {concurrency: 'unbounded'}
  ).pipe(Effect.fork);
  // Adjust the TestClock by 10 seconds
  yield* TestClock.adjust('10 seconds');
  // Await the value from the deferred
  const readRef = yield* Deferred.await(deferred);
  assert.ok(1 === readRef);
}).pipe(Effect.provide(TestContext.TestContext));
Effect.runPromise(test6);

const test7 = pipe(
  // Create a deferred value
  Deferred.make<number, void>(),
  Effect.tap(deferred =>
    // Run two effects concurrently: sleep for 10 seconds and succeed the deferred with a value of 1
    Effect.fork(
      Effect.all([Effect.sleep('10 seconds'), Deferred.succeed(deferred, 1)], {
        concurrency: 'unbounded',
      })
    )
  ),
  // Adjust the TestClock by 10 seconds
  Effect.tap(() => TestClock.adjust('10 seconds')),
  // Await the value from the deferred
  Effect.andThen(deferred => Deferred.await(deferred)),
  Effect.andThen(readRef => {
    assert.ok(1 === readRef);
  }),
  Effect.provide(TestContext.TestContext)
);

Effect.runPromise(test7);
