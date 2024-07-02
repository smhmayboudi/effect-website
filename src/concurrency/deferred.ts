import {Effect, Deferred, Exit, Cause, Fiber} from 'effect';

// const effectDeferred = Deferred.make<string, Error>();
// const effectGet = effectDeferred.pipe(
//   Effect.andThen(deferred => Deferred.await(deferred))
// );
// Effect.runPromise(effectGet);

// const program2 = Effect.gen(function* () {
//   const deferred = yield* Deferred.make<number, string>();
//   // Completing the Deferred in various ways
//   yield* Deferred.succeed(deferred, 1).pipe(Effect.fork);
//   yield* Deferred.complete(deferred, Effect.succeed(2)).pipe(Effect.fork);
//   yield* Deferred.completeWith(deferred, Effect.succeed(3)).pipe(Effect.fork);
//   yield* Deferred.done(deferred, Exit.succeed(4)).pipe(Effect.fork);
//   yield* Deferred.fail(deferred, '5').pipe(Effect.fork);
//   yield* Deferred.failCause(deferred, Cause.die(new Error('6'))).pipe(
//     Effect.fork
//   );
//   yield* Deferred.die(deferred, new Error('7')).pipe(Effect.fork);
//   yield* Deferred.interrupt(deferred).pipe(Effect.fork);
//   // Awaiting the Deferred to get its value
//   const value = yield* Deferred.await(deferred);
//   return value;
// });
// Effect.runPromise(program2).then(console.log, console.error); // Output: 1

// const program3 = Effect.gen(function* () {
//   const deferred = yield* Deferred.make<number, string>();
//   const b1 = yield* Deferred.fail(deferred, 'oh no!');
//   const b2 = yield* Deferred.succeed(deferred, 1);
//   return [b1, b2];
// });
// Effect.runPromise(program3).then(console.log); // Output: [ true, false ]
// /*
// Output: [ true, false ]
// */

// const program4 = Effect.gen(function* () {
//   const deferred = yield* Deferred.make<number, string>();
//   // Polling the Deferred
//   const done1 = yield* Deferred.poll(deferred);
//   // Checking if the Deferred is already completed
//   const done2 = yield* Deferred.isDone(deferred);
//   return [done1, done2];
// });
// Effect.runPromise(program4).then(console.log); // Output: [ none(), false ]
// /*
// Output: [ none(), false ]
// */

const program5 = Effect.gen(function* () {
  const deferred = yield* Deferred.make<string, string>();
  // Fiber A: Set the Deferred value after waiting for 1 second
  const sendHelloWorld = Effect.gen(function* () {
    yield* Effect.sleep('1 second');
    return yield* Deferred.succeed(deferred, 'hello world');
  });
  // Fiber B: Wait for the Deferred and print the value
  const getAndPrint = Effect.gen(function* () {
    const s = yield* Deferred.await(deferred);
    console.log(s);
    return s;
  });
  // Run both fibers concurrently
  const fiberA = yield* Effect.fork(sendHelloWorld);
  const fiberB = yield* Effect.fork(getAndPrint);
  // Wait for both fibers to complete
  return yield* Fiber.join(Fiber.zip(fiberA, fiberB));
});
Effect.runPromise(program5).then(console.log, console.error);
/*
Output:
hello world
[ true, "hello world" ]
*/
