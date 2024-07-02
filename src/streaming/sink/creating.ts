import {Stream, Sink, Effect, Schedule, Console, Chunk} from 'effect';

const effect = Stream.make(1, 2, 3, 4).pipe(Stream.run(Sink.head()));
Effect.runPromise(effect).then(console.log);
/*
Output:
{
  _id: "Option",
  _tag: "Some",
  value: 1
}
*/

const effect2 = Stream.make(1, 2, 3, 4).pipe(Stream.run(Sink.last()));
Effect.runPromise(effect2).then(console.log);
/*
Output:
{
  _id: "Option",
  _tag: "Some",
  value: 4
}
*/

const effect3 = Stream.make(1, 2, 3, 4).pipe(Stream.run(Sink.count));
Effect.runPromise(effect3).then(console.log);
/*
Output:
4
*/

const effect4 = Stream.make(1, 2, 3, 4).pipe(Stream.run(Sink.sum));
Effect.runPromise(effect4).then(console.log);
/*
Output:
10
*/

const effect5 = Stream.make(1, 2, 3, 4).pipe(Stream.run(Sink.take(3)));
Effect.runPromise(effect5).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 1, 2, 3 ]
}
*/

const effect6 = Stream.make(1, 2, 3, 4).pipe(Stream.run(Sink.drain));
Effect.runPromise(effect6).then(console.log);
/*
Output:
undefined
*/

const effect7 = Stream.make(1, 2, 3, 4).pipe(
  Stream.schedule(Schedule.spaced('100 millis')),
  Stream.run(Sink.timed)
);
Effect.runPromise(effect7).then(console.log);
/*
Output:
{
  _id: "Duration",
  _tag: "Millis",
  millis: 523
}
*/

const effect8 = Stream.make(1, 2, 3, 4).pipe(
  Stream.run(Sink.forEach(Console.log))
);
Effect.runPromise(effect8).then(console.log);
/*
Output:
1
2
3
4
undefined
*/

const effect9 = Stream.make(1, 2, 3, 4).pipe(Stream.run(Sink.succeed(0)));
Effect.runPromise(effect9).then(console.log);
/*
Output:
0
*/

const effect10 = Stream.make(1, 2, 3, 4).pipe(Stream.run(Sink.fail('fail!')));
Effect.runPromiseExit(effect10).then(console.log);
/*
Output:
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Fail', failure: 'fail!' }
}
*/

const effect11 = Stream.make(1, 2, 3, 4).pipe(Stream.run(Sink.collectAll()));
Effect.runPromise(effect11).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 1, 2, 3, 4 ]
}
*/

const effect12 = Stream.make(1, 2, 2, 3, 4, 4).pipe(
  Stream.run(Sink.collectAllToSet())
);
Effect.runPromise(effect12).then(console.log);
/*
Output:
{
  _id: "HashSet",
  values: [ 1, 2, 3, 4 ]
}
*/

const effect13 = Stream.make(1, 3, 2, 3, 1, 5, 1).pipe(
  Stream.run(
    Sink.collectAllToMap(
      n => n % 3,
      (a, b) => a + b
    )
  )
);

Effect.runPromise(effect13).then(console.log);
/*
Output:
{
  _id: "HashMap",
  values: [
    [ 0, 6 ], [ 1, 3 ], [ 2, 7 ]
  ]
}
*/

const effect14 = Stream.make(1, 2, 3, 4, 5).pipe(
  Stream.run(Sink.collectAllN(3))
);
Effect.runPromise(effect14).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 1, 2, 3 ]
}
*/

const effect15 = Stream.make(1, 2, 0, 4, 0, 6, 7).pipe(
  Stream.run(Sink.collectAllWhile(n => n !== 0))
);
Effect.runPromise(effect15).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 1, 2 ]
}
*/

const effect16 = Stream.make(1, 2, 2, 3, 4, 4).pipe(
  Stream.run(Sink.collectAllToSetN(3))
);
Effect.runPromise(effect16).then(console.log);
/*
Output:
{
  _id: "HashSet",
  values: [ 1, 2, 3 ]
}
*/

const effect17 = Stream.make(1, 3, 2, 3, 1, 5, 1).pipe(
  Stream.run(
    Sink.collectAllToMapN(
      3,
      n => n,
      (a, b) => a + b
    )
  )
);
Effect.runPromise(effect17).then(console.log);
/*
Output:
{
  _id: "HashMap",
  values: [
    [ 1, 2 ], [ 2, 2 ], [ 3, 6 ]
  ]
}
*/

const effect18 = Stream.make(1, 2, 3, 4).pipe(
  Stream.run(Sink.foldLeft(0, (a, b) => a + b))
);
Effect.runPromise(effect18).then(console.log);
/*
Output:
10
*/

const effect19 = Stream.iterate(0, n => n + 1).pipe(
  Stream.run(
    Sink.fold(
      0,
      sum => sum <= 10,
      (a, b) => a + b
    )
  )
);
Effect.runPromise(effect19).then(console.log);
/*
Output:
15
*/

const stream20 = Stream.make(3, 2, 4, 1, 5, 6, 2, 1, 3, 5, 6).pipe(
  Stream.transduce(
    Sink.foldWeighted({
      initial: Chunk.empty<number>(),
      maxCost: 3,
      cost: () => 1,
      body: (acc, el) => Chunk.append(acc, el),
    })
  )
);
Effect.runPromise(Stream.runCollect(stream20)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [
    {
      _id: "Chunk",
      values: [ 3, 2, 4 ]
    }, {
      _id: "Chunk",
      values: [ 1, 5, 6 ]
    }, {
      _id: "Chunk",
      values: [ 2, 1, 3 ]
    }, {
      _id: "Chunk",
      values: [ 5, 6 ]
    }
  ]
}
*/

const effect21 = Stream.make(1, 2, 3, 4, 5, 6, 7, 8, 9, 10).pipe(
  Stream.run(Sink.foldUntil(0, 3, (a, b) => a + b))
);
Effect.runPromise(effect21).then(console.log);
/*
Output:
6
*/
