import {Stream, Effect, Option, Cause, Console, Schedule} from 'effect';
import * as NodeReadLine from 'node:readline';

const s1 = Stream.make(1, 2, 3).pipe(
  Stream.concat(Stream.fail('Oh! Error!')),
  Stream.concat(Stream.make(4, 5))
);
const s2 = Stream.make('a', 'b', 'c');
const stream = Stream.orElse(s1, () => s2);
Effect.runPromise(Stream.runCollect(stream)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 1, 2, 3, "a", "b", "c" ]
}
*/

const s21 = Stream.make(1, 2, 3).pipe(
  Stream.concat(Stream.fail('Oh! Error!')),
  Stream.concat(Stream.make(4, 5))
);
const s22 = Stream.make('a', 'b', 'c');
const stream2 = Stream.orElseEither(s21, () => s22);
Effect.runPromise(Stream.runCollect(stream2)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [
    {
      _id: "Either",
      _tag: "Left",
      left: 1
    }, {
      _id: "Either",
      _tag: "Left",
      left: 2
    }, {
      _id: "Either",
      _tag: "Left",
      left: 3
    }, {
      _id: "Either",
      _tag: "Right",
      right: "a"
    }, {
      _id: "Either",
      _tag: "Right",
      right: "b"
    }, {
      _id: "Either",
      _tag: "Right",
      right: "c"
    }
  ]
}
*/

const s31 = Stream.make(1, 2, 3).pipe(
  Stream.concat(Stream.fail('Uh Oh!' as const)),
  Stream.concat(Stream.make(4, 5)),
  Stream.concat(Stream.fail('Ouch' as const))
);

const s32 = Stream.make('a', 'b', 'c');
const s33 = Stream.make(true, false, false);
const stream3 = Stream.catchAll(
  s31,
  (error): Stream.Stream<string | boolean> => {
    switch (error) {
      case 'Uh Oh!':
        return s32;
      case 'Ouch':
        return s33;
    }
  }
);

Effect.runPromise(Stream.runCollect(stream3)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 1, 2, 3, "a", "b", "c" ]
}
*/

const s41 = Stream.make(1, 2, 3).pipe(
  Stream.concat(Stream.dieMessage('Boom!')),
  Stream.concat(Stream.make(4, 5))
);
const s42 = Stream.make('a', 'b', 'c');
const stream4 = Stream.catchAllCause(s41, () => s42);
Effect.runPromise(Stream.runCollect(stream4)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 1, 2, 3, "a", "b", "c" ]
}
*/

const s51 = Stream.make(1, 2, 3).pipe(
  Stream.concat(Stream.fail('Oh! Error!')),
  Stream.concat(Stream.make(4, 5))
);
const s52 = Stream.make('a', 'b', 'c');
const stream5 = Stream.catchSome(s1, error => {
  if (error === 'Oh! Error!') {
    return Option.some(s52);
  }
  return Option.none();
});
Effect.runPromise(Stream.runCollect(stream5)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 1, 2, 3, "a", "b", "c" ]
}
*/

const s61 = Stream.make(1, 2, 3).pipe(
  Stream.concat(Stream.dieMessage('Oh! Error!')),
  Stream.concat(Stream.make(4, 5))
);
const s62 = Stream.make('a', 'b', 'c');
const stream6 = Stream.catchSomeCause(s61, cause => {
  if (Cause.isDie(cause)) {
    return Option.some(s62);
  }
  return Option.none();
});
Effect.runPromise(Stream.runCollect(stream6)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 1, 2, 3, "a", "b", "c" ]
}
*/

const stream7 = Stream.make(1, 2, 3).pipe(
  Stream.concat(Stream.dieMessage('Oh! Boom!')),
  Stream.concat(Stream.make(4, 5)),
  Stream.onError(() =>
    Console.log(
      'Stream application closed! We are doing some cleanup jobs.'
    ).pipe(Effect.orDie)
  )
);
Effect.runPromise(Stream.runCollect(stream7)).then(console.log);
/*
Output:
Stream application closed! We are doing some cleanup jobs.
error: RuntimeException: Oh! Boom!
*/

const stream8 = Stream.make(1, 2, 3).pipe(
  Stream.concat(
    Stream.fromEffect(
      Effect.gen(function* () {
        const s = yield* readLine('Enter a number: ');
        const n = parseInt(s);
        if (Number.isNaN(n)) {
          return yield* Effect.fail('NaN');
        }
        return n;
      })
    ).pipe(Stream.retry(Schedule.exponential('1 second')))
  )
);

Effect.runPromise(Stream.runCollect(stream8)).then(console.log);
/*
Output:
Enter a number: a
Enter a number: b
Enter a number: c
Enter a number: 4
{
  _id: "Chunk",
  values: [ 1, 2, 3, 4 ]
}
*/

const readLine = (message: string): Effect.Effect<string> =>
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

const stream9 = Stream.fail(new Error());
const res9 = Stream.refineOrDie(stream9, error => {
  if (error instanceof SyntaxError) {
    return Option.some(error);
  }
  return Option.none();
});

const stream10 = Stream.fromEffect(Effect.never).pipe(
  Stream.timeout('2 seconds')
);
Effect.runPromise(Stream.runCollect(stream10)).then(console.log);
/*
{
  _id: "Chunk",
  values: []
}
*/

const stream11 = Stream.fromEffect(Effect.never).pipe(
  Stream.timeoutFail(() => 'timeout', '2 seconds')
);
Effect.runPromiseExit(Stream.runCollect(stream11)).then(console.log);
/*
Output:
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Fail', failure: 'timeout' }
}
*/

const stream12 = Stream.fromEffect(Effect.never).pipe(
  Stream.timeoutFailCause(() => Cause.die('timeout'), '2 seconds')
);
Effect.runPromiseExit(Stream.runCollect(stream12)).then(console.log);
/*
Output:
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Die', defect: 'timeout' }
}
*/

const stream13 = Stream.fromEffect(Effect.never).pipe(
  Stream.timeoutTo('2 seconds', Stream.make(1, 2, 3))
);
Effect.runPromise(Stream.runCollect(stream13)).then(console.log);
/*
{
  _id: "Chunk",
  values: [ 1, 2, 3 ]
}
*/
