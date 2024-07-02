import {Stream, Effect, Console, Sink} from 'effect';

const stream = Stream.make(1, 2, 3, 4, 5);
const collectedData = Stream.runCollect(stream);
Effect.runPromise(collectedData).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 1, 2, 3, 4, 5 ]
}
*/

const effect = Stream.make(1, 2, 3).pipe(
  Stream.runForEach(n => Console.log(n))
);
Effect.runPromise(effect).then(console.log);
/*
Output:
1
2
3
undefined
*/

const e1 = Stream.make(1, 2, 3, 4, 5).pipe(Stream.runFold(0, (a, b) => a + b));
Effect.runPromise(e1).then(console.log); // Output: 15
const e2 = Stream.make(1, 2, 3, 4, 5).pipe(
  Stream.runFoldWhile(
    0,
    n => n <= 3,
    (a, b) => a + b
  )
);
Effect.runPromise(e2).then(console.log); // Output: 6

const effect2 = Stream.make(1, 2, 3).pipe(Stream.run(Sink.sum));
Effect.runPromise(effect2).then(console.log); // Output: 6
