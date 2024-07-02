import {Effect, Fiber, Random, Ref, Stream, SubscriptionRef} from 'effect';

const ref = SubscriptionRef.make(0);

const server = (ref: Ref.Ref<number>) =>
  Ref.update(ref, n => n + 1).pipe(Effect.forever);

const server2 = (ref: Ref.Ref<number>) =>
  Ref.update(ref, n => n + 1).pipe(Effect.forever);

const client2 = (changes: Stream.Stream<number>) =>
  Effect.gen(function* ($) {
    const n = yield* Random.nextIntBetween(1, 10);
    const chunk = yield* $(Stream.runCollect(Stream.take(changes, n)));
    return chunk;
  });

const server3 = (ref: Ref.Ref<number>) =>
  Ref.update(ref, n => n + 1).pipe(Effect.forever);

const client3 = (changes: Stream.Stream<number>) =>
  Effect.gen(function* ($) {
    const n = yield* Random.nextIntBetween(1, 10);
    const chunk = yield* $(Stream.runCollect(Stream.take(changes, n)));
    return chunk;
  });

const program = Effect.gen(function* () {
  const ref = yield* SubscriptionRef.make(0);
  const serverFiber = yield* Effect.fork(server3(ref));
  const clients = new Array(5).fill(null).map(() => client3(ref.changes));
  const chunks = yield* Effect.all(clients, {concurrency: 'unbounded'});
  yield* Fiber.interrupt(serverFiber);
  for (const chunk of chunks) {
    console.log(chunk);
  }
});

Effect.runPromise(program);
/*
  Output:
  {
    _id: "Chunk",
    values: [ 2, 3, 4 ]
  }
  {
    _id: "Chunk",
    values: [ 2 ]
  }
  {
    _id: "Chunk",
    values: [ 2, 3, 4, 5, 6, 7 ]
  }
  {
    _id: "Chunk",
    values: [ 2, 3, 4 ]
  }
  {
    _id: "Chunk",
    values: [ 2, 3, 4, 5, 6, 7, 8, 9 ]
  }
  */
