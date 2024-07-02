import {Stream, Console, Effect, Random} from 'effect';

const stream = Stream.make(1, 2, 3).pipe(
  Stream.tap(n => Console.log(`before mapping: ${n}`)),
  Stream.map(n => n * 2),
  Stream.tap(n => Console.log(`after mapping: ${n}`))
);
Effect.runPromise(Stream.runCollect(stream)).then(console.log);
/*
Output:
before mapping: 1
after mapping: 2
before mapping: 2
after mapping: 4
before mapping: 3
after mapping: 6
{
  _id: "Chunk",
  values: [ 2, 4, 6 ]
}
*/

const stream2 = Stream.iterate(0, n => n + 1);
// Using `take` to extract a fixed number of elements:
const s1 = Stream.take(stream2, 5);
Effect.runPromise(Stream.runCollect(s1)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 0, 1, 2, 3, 4 ]
}
*/
// Using `takeWhile` to extract elements until a certain condition is met:
const s2 = Stream.takeWhile(stream2, n => n < 5);
Effect.runPromise(Stream.runCollect(s2)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 0, 1, 2, 3, 4 ]
}
*/
// Using `takeUntil` to extract elements until a specific condition is met:
const s3 = Stream.takeUntil(stream2, n => n === 5);
Effect.runPromise(Stream.runCollect(s3)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 0, 1, 2, 3, 4, 5 ]
}
*/
// Using `takeRight` to extract a specified number of elements from the end:
const s4 = Stream.takeRight(s3, 3);
Effect.runPromise(Stream.runCollect(s4)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 3, 4, 5 ]
}
*/

// Simulate a chunked stream
const stream3 = Stream.fromIterable([1, 2, 3, 4, 5]).pipe(Stream.rechunk(2));
const program = Effect.gen(function* () {
  // Create an effect to get data chunks from the stream3
  const getChunk = yield* Stream.toPull(stream3);
  // Continuously fetch and process chunks
  while (true) {
    const chunk = yield* getChunk;
    console.log(chunk);
  }
});
Effect.runPromise(Effect.scoped(program)).then(console.log, console.error);
/*
Output:
{ _id: 'Chunk', values: [ 1, 2 ] }
{ _id: 'Chunk', values: [ 3, 4 ] }
{ _id: 'Chunk', values: [ 5 ] }
(FiberFailure) {
  "_id": "Option",
  "_tag": "None"
}
*/

const stream4 = Stream.make(1, 2, 3).pipe(Stream.map(n => n + 1));
Effect.runPromise(Stream.runCollect(stream4)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 2, 3, 4 ]
}
*/

const stream5 = Stream.make(10, 20, 30).pipe(
  Stream.mapEffect(n => Random.nextIntBetween(0, n))
);
Effect.runPromise(Stream.runCollect(stream5)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 6, 13, 5 ]
}
*/

const getUrls = Effect.succeed(['url0', 'url1', 'url2']);
const fetchUrl = (url: string) =>
  Effect.succeed([
    `Resource 0-${url}`,
    `Resource 1-${url}`,
    `Resource 2-${url}`,
  ]);
const stream6 = Stream.fromIterableEffect(getUrls).pipe(
  Stream.mapEffect(fetchUrl, {concurrency: 4})
);
Effect.runPromise(Stream.runCollect(stream6)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [
    [ "Resource 0-url0", "Resource 1-url0", "Resource 2-url0" ], [ "Resource 0-url1", "Resource 1-url1",
      "Resource 2-url1" ], [ "Resource 0-url2", "Resource 1-url2", "Resource 2-url2" ]
  ]
}
*/

const runningTotal = (stream: Stream.Stream<number>): Stream.Stream<number> =>
  stream.pipe(Stream.mapAccum(0, (s, a) => [s + a, s + a]));
// input:  0, 1, 2, 3, 4, 5
Effect.runPromise(Stream.runCollect(runningTotal(Stream.range(0, 6)))).then(
  console.log
);
/*
Output:
{
  _id: "Chunk",
  values: [ 0, 1, 3, 6, 10, 15 ]
}
*/

const stream7 = Stream.range(1, 5).pipe(Stream.as(null));
Effect.runPromise(Stream.runCollect(stream7)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ null, null, null, null ]
}
*/

// https://effect.website/docs/guides/streaming/stream/operations#filtering
