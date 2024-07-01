import {Chunk, Console, Context, Effect, Fiber, Ref} from 'effect';
import * as NodeReadLine from 'node:readline';

export class Counter {
  inc: Effect.Effect<void>;
  dec: Effect.Effect<void>;
  get: Effect.Effect<number>;
  constructor(private value: Ref.Ref<number>) {
    this.inc = Ref.update(this.value, n => n + 1);
    this.dec = Ref.update(this.value, n => n - 1);
    this.get = Ref.get(this.value);
  }
}
const make = Effect.andThen(Ref.make(0), value => new Counter(value));

const program = Effect.gen(function* () {
  const counter = yield* make;
  yield* counter.inc;
  yield* counter.inc;
  yield* counter.dec;
  yield* counter.inc;
  const value = yield* counter.get;
  console.log(`This counter has a value of ${value}.`);
});

Effect.runPromise(program);
/*
Output:
This counter has a value of 2.
*/

const program2 = make.pipe(
  Effect.andThen(counter =>
    counter.inc.pipe(
      Effect.andThen(counter.inc),
      Effect.andThen(counter.dec),
      Effect.andThen(counter.inc),
      Effect.andThen(counter.get),
      Effect.andThen(value =>
        Console.log(`This counter has a value of ${value}.`)
      )
    )
  )
);

Effect.runPromise(program2);
/*
This counter has a value of 2.
*/

const program3 = Effect.gen(function* () {
  const counter = yield* make;

  const logCounter = <R, E, A>(label: string, effect: Effect.Effect<A, E, R>) =>
    Effect.gen(function* () {
      const value = yield* counter.get;
      yield* Effect.log(`${label} get: ${value}`);
      return yield* effect;
    });

  yield* logCounter('task 1', counter.inc).pipe(
    Effect.zip(logCounter('task 2', counter.inc), {concurrent: true}),
    Effect.zip(logCounter('task 3', counter.dec), {concurrent: true}),
    Effect.zip(logCounter('task 4', counter.inc), {concurrent: true})
  );
  const value = yield* counter.get;
  yield* Effect.log(`This counter has a value of ${value}.`);
});

Effect.runPromise(program3);
/*
Output:
... fiber=#2 message="task 4 get: 0"
... fiber=#4 message="task 3 get: 1"
... fiber=#5 message="task 1 get: 0"
... fiber=#5 message="task 2 get: 1"
... fiber=#0 message="This counter has a value of 2."
*/

const program4 = make.pipe(
  Effect.andThen(counter => {
    const logCounter = <R, E, A>(
      label: string,
      effect: Effect.Effect<A, E, R>
    ) =>
      counter.get.pipe(
        Effect.andThen(value => Effect.log(`${label} get: ${value}`)),
        Effect.andThen(effect)
      );
    return logCounter('task 1', counter.inc).pipe(
      Effect.zip(logCounter('task 2', counter.inc), {concurrent: true}),
      Effect.zip(logCounter('task 3', counter.dec), {concurrent: true}),
      Effect.zip(logCounter('task 4', counter.inc), {concurrent: true}),
      Effect.andThen(counter.get),
      Effect.andThen(value =>
        Effect.log(`This counter has a value of ${value}.`)
      )
    );
  })
);
Effect.runPromise(program4);
/*
Output:
... fiber=#2 message="task 4 get: 0"
... fiber=#4 message="task 3 get: 1"
... fiber=#5 message="task 1 get: 0"
... fiber=#5 message="task 2 get: 1"
... fiber=#0 message="This counter has a value of 2."
*/

// Create a Tag for our state
class MyState5 extends Context.Tag('MyState')<MyState5, Ref.Ref<number>>() {}
// Subprogram 1: Increment the state value twice
const subprogram51 = Effect.gen(function* () {
  const state = yield* MyState5;
  yield* Ref.update(state, n => n + 1);
  yield* Ref.update(state, n => n + 1);
});
// Subprogram 2: Decrement the state value and then increment it
const subprogram52 = Effect.gen(function* () {
  const state = yield* MyState5;
  yield* Ref.update(state, n => n - 1);
  yield* Ref.update(state, n => n + 1);
});
// Subprogram 3: Read and log the current value of the state
const subprogram53 = Effect.gen(function* () {
  const state = yield* MyState5;
  const value = yield* Ref.get(state);
  console.log(`MyState has a value of ${value}.`);
});
// Compose subprograms 1, 2, and 3 to create the main program
const program5 = Effect.gen(function* () {
  yield* subprogram51;
  yield* subprogram52;
  yield* subprogram53;
});
// Create a Ref instance with an initial value of 0
const initialState5 = Ref.make(0);
// Provide the Ref as a service
const runnable5 = Effect.provideServiceEffect(
  program5,
  MyState5,
  initialState5
);
// Run the program and observe the output
Effect.runPromise(runnable5);
/*
Output:
MyState has a value of 2.
*/

// Create a Tag for our state
class MyState6 extends Context.Tag('MyState')<MyState6, Ref.Ref<number>>() {}
// Subprogram 1: Increment the state value twice
const subprogram61 = MyState6.pipe(
  Effect.tap(state => Ref.update(state, n => n + 1)),
  Effect.andThen(state => Ref.update(state, n => n + 1))
);
// Subprogram 2: Decrement the state value and then increment it
const subprogram62 = MyState6.pipe(
  Effect.tap(state => Ref.update(state, n => n - 1)),
  Effect.andThen(state => Ref.update(state, n => n + 1))
);
// Subprogram 3: Read and log the current value of the state
const subprogram63 = MyState6.pipe(
  Effect.andThen(state => Ref.get(state)),
  Effect.andThen(value => Console.log(`MyState has a value of ${value}.`))
);
// Compose subprograms 1, 2, and 3 to create the main program
const program6 = subprogram61.pipe(
  Effect.andThen(subprogram62),
  Effect.andThen(subprogram63)
);
// Create a Ref instance with an initial value of 0
const initialState6 = Ref.make(0);
// Provide the Ref as a service
const runnable6 = Effect.provideServiceEffect(
  program6,
  MyState6,
  initialState6
);
// Run the program and observe the output
Effect.runPromise(runnable6);
/*
Output:
MyState has a value of 2.
*/

export const readLine = (message: string): Effect.Effect<string> =>
  Effect.promise(
    () =>
      new Promise(resolve => {
        const rl = NodeReadLine.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        rl.question(message, answer => {
          rl.close();
          resolve(answer);
        });
      })
  );

const getNames = Effect.gen(function* () {
  const ref = yield* Ref.make(Chunk.empty<string>());
  while (true) {
    const name = yield* readLine('Please enter a name or `q` to exit: ');
    if (name === 'q') {
      break;
    }
    yield* Ref.update(ref, state => Chunk.append(state, name));
  }
  return yield* Ref.get(ref);
});
Effect.runPromise(getNames).then(console.log);
/*
Output:
Please enter a name or `q` to exit: Alice
Please enter a name or `q` to exit: Bob
Please enter a name or `q` to exit: q
{
  _id: "Chunk",
  values: [ "Alice", "Bob" ]
}
*/

const getNames2 = Ref.make(Chunk.empty<string>()).pipe(
  Effect.andThen(ref =>
    readLine('Please enter a name or `q` to exit: ').pipe(
      Effect.repeat({
        while: name => {
          if (name === 'q') {
            return Effect.succeed(false);
          } else {
            return ref.pipe(
              Ref.update(state => Chunk.append(state, name)),
              Effect.as(true)
            );
          }
        },
      }),
      Effect.andThen(Ref.get(ref))
    )
  )
);
Effect.runPromise(getNames2).then(console.log);
/*
Output:
Please enter a name or `q` to exit: Alice
Please enter a name or `q` to exit: Bob
Please enter a name or `q` to exit: q
{
  _id: "Chunk",
  values: [ "Alice", "Bob" ]
}
*/

const getNames3 = Effect.gen(function* () {
  const ref = yield* Ref.make(Chunk.empty<string>());
  const fiber1 = yield* Effect.fork(
    Effect.gen(function* () {
      while (true) {
        const name = yield* readLine('Please enter a name or `q` to exit: ');
        if (name === 'q') {
          break;
        }
        yield* Ref.update(ref, state => Chunk.append(state, name));
      }
    })
  );
  const fiber2 = yield* Effect.fork(
    Effect.gen(function* () {
      for (const name of ['John', 'Jane', 'Joe', 'Tom']) {
        yield* Ref.update(ref, state => Chunk.append(state, name));
        yield* Effect.sleep('1 second');
      }
    })
  );
  yield* Fiber.join(fiber1);
  yield* Fiber.join(fiber2);
  return yield* Ref.get(ref);
});
Effect.runPromise(getNames3).then(console.log);
/*
Output:
Please enter a name or `q` to exit: Alice
Please enter a name or `q` to exit: Bob
Please enter a name or `q` to exit: q
{
  _id: "Chunk",
  values: [ ... ]
}
*/

const getNames4 = Ref.make(Chunk.empty<string>()).pipe(
  Effect.andThen(ref => {
    const fiber1 = readLine('Please enter a name or `q` to exit: ').pipe(
      Effect.repeat({
        while: name => {
          if (name === 'q') {
            return Effect.succeed(false);
          } else {
            return ref.pipe(
              Ref.update(state => Chunk.append(state, name)),
              Effect.as(true)
            );
          }
        },
      }),
      Effect.fork
    );
    const fiber2 = Effect.fork(
      Effect.forEach(
        ['John', 'Jane', 'Joe', 'Tom'],
        name =>
          ref.pipe(
            Ref.update(state => Chunk.append(state, name)),
            Effect.andThen(Effect.sleep('1 second'))
          ),
        {concurrency: 'unbounded', discard: true}
      )
    );
    return Effect.all([fiber1, fiber2]).pipe(
      Effect.andThen(([f1, f2]) =>
        Fiber.join(f1).pipe(Effect.andThen(Fiber.join(f2)))
      ),
      Effect.andThen(Ref.get(ref))
    );
  })
);
Effect.runPromise(getNames4).then(console.log);
/*
Output:
Please enter a name or `q` to exit: Alice
Please enter a name or `q` to exit: Bob
Please enter a name or `q` to exit: q
{
  _id: "Chunk",
  values: [ ... ]
}
*/
