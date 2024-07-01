import {Effect, Schedule, Layer, Request} from 'effect';
import * as Queries from './Queries';
// const program = Effect.gen(function* () {
//   const todos = yield* Queries.getTodos;
//   yield* Effect.forEach(todos, todo => Queries.notifyOwner(todo), {
//     batching: true,
//   });
// });

// const program = Effect.gen(function* () {
//   const todos = yield* Queries.getTodos;
//   yield* Effect.forEach(todos, todo => Queries.notifyOwner(todo), {
//     concurrency: 'unbounded',
//   });
// }).pipe(Effect.withRequestBatching(false));

// const program = Effect.gen(function* () {
//   const todos = yield* Queries.getTodos;
//   yield* Effect.forEach(todos, todo => Queries.notifyOwner(todo), {
//     concurrency: 'unbounded',
//   });
// }).pipe(Effect.repeat(Schedule.fixed('10 seconds')));

const program = Effect.gen(function* () {
  const todos = yield* Queries.getTodos;
  yield* Effect.forEach(todos, todo => Queries.notifyOwner(todo), {
    concurrency: 'unbounded',
  });
}).pipe(
  Effect.repeat(Schedule.fixed('10 seconds')),
  Effect.provide(
    Layer.setRequestCache(
      Request.makeCache({capacity: 256, timeToLive: '60 minutes'})
    )
  )
);
