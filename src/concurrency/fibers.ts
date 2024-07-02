import {
  Console,
  Effect,
  Fiber,
  Schedule,
  Stream,
  SubscriptionRef,
} from 'effect';

const child = Effect.repeat(
  Console.log('child: still running!'),
  Schedule.fixed('1 second')
);
const parent = Effect.gen(function* () {
  console.log('parent: started!');
  yield* Effect.fork(child);
  yield* Effect.sleep('3 seconds');
  console.log('parent: finished!');
});
Effect.runPromise(parent);
/*
parent: started!
child: still running!
child: still running!
child: still running!
parent: finished!
*/

const daemon2 = Effect.repeat(
  Console.log('daemon2: still running!'),
  Schedule.fixed('1 second')
);
const parent2 = Effect.gen(function* () {
  console.log('parent2: started!');
  yield* Effect.forkDaemon(daemon2);
  yield* Effect.sleep('3 seconds');
  console.log('parent2: finished!');
});
Effect.runPromise(parent2);
/*
parent: started!
daemon: still running!
daemon: still running!
daemon: still running!
parent: finished!
daemon: still running!
daemon: still running!
daemon: still running!
daemon: still running!
daemon: still running!
...etc...
*/

const daemon3 = Effect.repeat(
  Console.log('daemon3: still running!'),
  Schedule.fixed('1 second')
);
const parent3 = Effect.gen(function* () {
  console.log('parent3: started!');
  yield* Effect.forkDaemon(daemon3);
  yield* Effect.sleep('3 seconds');
  console.log('parent3: finished!');
}).pipe(Effect.onInterrupt(() => Console.log('parent3: interrupted!')));
const program3 = Effect.gen(function* () {
  const fiber = yield* Effect.fork(parent3);
  yield* Effect.sleep('2 seconds');
  yield* Fiber.interrupt(fiber);
});
Effect.runPromise(program3);
/*
parent: started!
daemon: still running!
daemon: still running!
parent: interrupted!
daemon: still running!
daemon: still running!
daemon: still running!
daemon: still running!
daemon: still running!
...etc...
*/

const child4 = Effect.repeat(
  Console.log('child4: still running!'),
  Schedule.fixed('1 second')
);
const parent4 = Effect.gen(function* () {
  console.log('parent4: started!');
  yield* Effect.forkScoped(child4);
  yield* Effect.sleep('3 seconds');
  console.log('parent4: finished!');
});
const program4 = Effect.scoped(
  Effect.gen(function* () {
    console.log('Local scope started!');
    yield* Effect.fork(parent4);
    yield* Effect.sleep('5 seconds');
    console.log('Leaving the local scope!');
  })
);
Effect.runPromise(program4);
/*
Local scope started!
parent: started!
child: still running!
child: still running!
child: still running!
parent: finished!
child: still running!
child: still running!
Leaving the local scope!
*/

const child5 = Console.log('child5: still running!').pipe(
  Effect.repeat(Schedule.fixed('1 second'))
);
const program5 = Effect.scoped(
  Effect.gen(function* () {
    yield* Effect.addFinalizer(() =>
      Console.log('The outer scope is about to be closed!')
    );
    const outerScope = yield* Effect.scope;
    yield* Effect.scoped(
      Effect.gen(function* () {
        yield* Effect.addFinalizer(() =>
          Console.log('The inner scope is about to be closed!')
        );
        yield* Effect.forkIn(child5, outerScope);
        yield* Effect.sleep('3 seconds');
      })
    );
    yield* Effect.sleep('5 seconds');
  })
);
Effect.runPromise(program5);

/*
child: still running!
child: still running!
child: still running!
The inner scope is about to be closed!
child: still running!
child: still running!
child: still running!
child: still running!
child: still running!
child: still running!
The outer scope is about to be closed!
*/

const program6 = Effect.gen(function* () {
  const ref = yield* SubscriptionRef.make(0);
  yield* ref.changes.pipe(
    Stream.tap(n => Console.log(`SubscriptionRef changed to ${n}`)),
    Stream.runDrain,
    Effect.fork
  );
  yield* SubscriptionRef.set(ref, 1);
  yield* SubscriptionRef.set(ref, 2);
});

Effect.runPromise(program6);
/*
Output:
SubscriptionRef changed to 2
*/

const program7 = Effect.gen(function* () {
  const ref = yield* SubscriptionRef.make(0);
  yield* ref.changes.pipe(
    Stream.tap(n => Console.log(`SubscriptionRef changed to ${n}`)),
    Stream.runDrain,
    Effect.fork
  );
  yield* Effect.yieldNow();
  yield* SubscriptionRef.set(ref, 1);
  yield* SubscriptionRef.set(ref, 2);
});
Effect.runPromise(program7);
/*
Output:
SubscriptionRef changed to 0
SubscriptionRef changed to 1
SubscriptionRef changed to 2
*/
