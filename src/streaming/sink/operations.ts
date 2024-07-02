import {Stream, Sink, Effect} from 'effect';

const numericSum = Sink.sum;
const stringSum = numericSum.pipe(
  Sink.mapInput((s: string) => Number.parseFloat(s))
);
Effect.runPromise(
  Stream.make('1', '2', '3', '4', '5').pipe(Stream.run(stringSum))
).then(console.log);
/*
Output:
15
*/

// Convert its input to integers, do the computation and then convert them back to a string
const sumSink = Sink.sum.pipe(
  Sink.dimap({
    onInput: (s: string) => Number.parseFloat(s),
    onDone: n => String(n),
  })
);

Effect.runPromise(
  Stream.make('1', '2', '3', '4', '5').pipe(Stream.run(sumSink))
).then(console.log);
/*
Output:
15 <-- as string
*/

const stream = Stream.make(1, -2, 0, 1, 3, -3, 4, 2, 0, 1, -3, 1, 1, 6).pipe(
  Stream.transduce(
    Sink.collectAllN<number>(3).pipe(Sink.filterInput(n => n > 0))
  )
);
Effect.runPromise(Stream.runCollect(stream)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [
    {
      _id: "Chunk",
      values: [ 1, 1, 3 ]
    }, {
      _id: "Chunk",
      values: [ 4, 2, 1 ]
    }, {
      _id: "Chunk",
      values: [ 1, 1, 6 ]
    }, {
      _id: "Chunk",
      values: []
    }
  ]
}
*/
