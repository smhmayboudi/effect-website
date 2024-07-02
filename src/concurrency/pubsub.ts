import {Effect, PubSub, Queue, Console} from 'effect';

const program = PubSub.bounded<string>(2).pipe(
  Effect.andThen(pubsub =>
    Effect.scoped(
      Effect.gen(function* () {
        const dequeue1 = yield* PubSub.subscribe(pubsub);
        const dequeue2 = yield* PubSub.subscribe(pubsub);
        yield* PubSub.publish(pubsub, 'Hello from a PubSub!');
        yield* Queue.take(dequeue1).pipe(Effect.andThen(Console.log));
        yield* Queue.take(dequeue2).pipe(Effect.andThen(Console.log));
      })
    )
  )
);
Effect.runPromise(program);
/*
Output:
Hello from a PubSub!
Hello from a PubSub!
*/

const boundedPubSub = PubSub.bounded<string>(2);

const droppingPubSub = PubSub.dropping<string>(2);

const slidingPubSub = PubSub.sliding<string>(2);

const unboundedPubSub = PubSub.unbounded<string>();

const program2 = PubSub.bounded<string>(2).pipe(
  Effect.andThen(pubsub =>
    Effect.scoped(
      Effect.gen(function* () {
        const dequeue = yield* PubSub.subscribe(pubsub);
        yield* PubSub.publishAll(pubsub, ['Message 1', 'Message 2']);
        yield* Queue.takeAll(dequeue).pipe(Effect.andThen(Console.log));
      })
    )
  )
);
Effect.runPromise(program2);
/*
Output:
{
  _id: "Chunk",
  values: [ "Message 1", "Message 2" ]
}
*/

const program3 = PubSub.bounded<number>(2).pipe(
  Effect.tap(pubsub => Console.log(`capacity: ${PubSub.capacity(pubsub)}`)),
  Effect.tap(pubsub =>
    PubSub.size(pubsub).pipe(
      Effect.andThen(size => Console.log(`size: ${size}`))
    )
  )
);
Effect.runPromise(program3);
/*
Output:
capacity: 2
size: 0
*/
