import {Scope, Effect, Console, Exit} from 'effect';
const program =
  // create a new scope
  Scope.make().pipe(
    // add finalizer 1
    Effect.tap(scope => Scope.addFinalizer(scope, Console.log('finalizer 1'))),
    // add finalizer 2
    Effect.tap(scope => Scope.addFinalizer(scope, Console.log('finalizer 2'))),
    // close the scope
    Effect.andThen(scope =>
      Scope.close(scope, Exit.succeed('scope closed successfully'))
    )
  );
Effect.runPromise(program);
/*
Output:
finalizer 2 <-- finalizers are closed in reverse order
finalizer 1
*/

const program2 = Effect.gen(function* () {
  yield* Effect.addFinalizer(exit =>
    Console.log(`finalizer after ${exit._tag}`)
  );
  return 1;
});
const runnable2 = Effect.scoped(program2);
Effect.runPromise(runnable2).then(console.log, console.error);
/*
Output:
finalizer after Success
1
*/

const program3 = Effect.addFinalizer(exit =>
  Console.log(`finalizer after ${exit._tag}`)
).pipe(Effect.andThen(Effect.succeed(1)));
const runnable3 = Effect.scoped(program3);
Effect.runPromise(runnable3).then(console.log, console.error);
/*
Output:
finalizer after Success
1
*/

const program4 = Effect.gen(function* () {
  yield* Effect.addFinalizer(exit =>
    Console.log(`finalizer after ${exit._tag}`)
  );
  return yield* Effect.fail('Uh oh!');
});
const runnable4 = Effect.scoped(program4);
Effect.runPromiseExit(runnable4).then(console.log);

/*
Output:
finalizer after Failure
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Fail', failure: 'Uh oh!' }
}
*/

const program5 = Effect.addFinalizer(exit =>
  Console.log(`finalizer after ${exit._tag}`)
).pipe(Effect.andThen(Effect.fail('Uh oh!')));
const runnable5 = Effect.scoped(program5);
Effect.runPromiseExit(runnable5).then(console.log);
/*
Output:
finalizer after Failure
{
  id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Fail', failure: 'Uh oh!' }
}
*/

const task1 = Effect.gen(function* () {
  console.log('task 1');
  yield* Effect.addFinalizer(() => Console.log('finalizer after task 1'));
});
const task2 = Effect.gen(function* () {
  console.log('task 2');
  yield* Effect.addFinalizer(() => Console.log('finalizer after task 2'));
});
const program6 = Effect.gen(function* () {
  // Both of these scopes are merged into one
  yield* task1;
  yield* task2;
});
Effect.runPromise(program6.pipe(Effect.scoped));
/*
Output:
task 1
task 2
finalizer after task 2
finalizer after task 1
*/

const task12 = Console.log('task 1').pipe(
  Effect.tap(() =>
    Effect.addFinalizer(() => Console.log('finalizer after task 1'))
  )
);
const task22 = Console.log('task 2').pipe(
  Effect.tap(() =>
    Effect.addFinalizer(() => Console.log('finalizer after task 2'))
  )
);
const program7 =
  // Both of these scopes are merged into one
  Effect.all([task12, task22], {discard: true});
Effect.runPromise(program7.pipe(Effect.scoped));
/*
Output:
task 1
task 2
finalizer after task 2
finalizer after task 1
*/

const task13 = Effect.gen(function* () {
  console.log('task 1');
  yield* Effect.addFinalizer(() => Console.log('finalizer after task 1'));
});
const task23 = Effect.gen(function* () {
  console.log('task 2');
  yield* Effect.addFinalizer(() => Console.log('finalizer after task 2'));
});
const program8 = Effect.gen(function* () {
  const scope1 = yield* Scope.make();
  const scope2 = yield* Scope.make();
  // Extend the scope of task13 into scope1
  yield* task13.pipe(Scope.extend(scope1));
  // Extend the scope of task23 into scope2
  yield* task23.pipe(Scope.extend(scope2));
  // Close scope1 and scope2 manually
  yield* Scope.close(scope1, Exit.void);
  yield* Console.log('doing something else');
  yield* Scope.close(scope2, Exit.void);
});
Effect.runPromise(program8);
/*
Output:
task 1
task 2
finalizer after task 1
doing something else
finalizer after task 2
*/

const task14 = Console.log('task 1').pipe(
  Effect.tap(() =>
    Effect.addFinalizer(() => Console.log('finalizer after task 1'))
  )
);
const task24 = Console.log('task 2').pipe(
  Effect.tap(() =>
    Effect.addFinalizer(() => Console.log('finalizer after task 2'))
  )
);
const program9 = Effect.all([Scope.make(), Scope.make()]).pipe(
  Effect.andThen(([scope1, scope2]) =>
    Scope.extend(task14, scope1).pipe(
      Effect.andThen(Scope.extend(task24, scope2)),
      Effect.andThen(Scope.close(scope1, Exit.void)),
      Effect.andThen(Console.log('doing something else')),
      Effect.andThen(Scope.close(scope2, Exit.void))
    )
  )
);
Effect.runPromise(program9);
/*
Output:
task 1
task 2
finalizer after task 1
doing something else
finalizer after task 2
*/

// Define the interface for the resource
export interface MyResource {
  readonly contents: string;
  readonly close: () => Promise<void>;
}
// Simulate getting the resource
const getMyResource = (): Promise<MyResource> =>
  Promise.resolve({
    contents: 'lorem ipsum',
    close: () =>
      new Promise(resolve => {
        console.log('Resource released');
        resolve();
      }),
  });
// Define the acquisition of the resource with error handling
export const acquire = Effect.tryPromise({
  try: () =>
    getMyResource().then(res => {
      console.log('Resource acquired');
      return res;
    }),
  catch: () => new Error('getMyResourceError'),
});
// Define the release of the resource
export const release = (res: MyResource) => Effect.promise(() => res.close());
export const resource = Effect.acquireRelease(acquire, release);

const program10 = Effect.gen(function* () {
  const res = yield* resource;
  console.log(`content is ${res.contents}`);
});

const program11 = resource.pipe(
  Effect.andThen(res => Console.log(`content is ${res.contents}`))
);

const program12 = Effect.scoped(
  Effect.gen(function* () {
    const res = yield* resource;
    console.log(`content is ${res.contents}`);
  })
);
const program13 = Effect.scoped(
  resource.pipe(
    Effect.andThen(res => Console.log(`content is ${res.contents}`))
  )
);

const use = (res: MyResource) => Console.log(`content is ${res.contents}`);
const program14 = Effect.acquireUseRelease(acquire, use, release);
Effect.runPromise(program14);
/*
Output:
Resource acquired
content is lorem ipsum
Resource released
*/
