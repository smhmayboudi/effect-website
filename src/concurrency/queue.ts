import {Array, Console, Effect, Fiber, Queue} from 'effect';

const program = Effect.gen(function* () {
  const queue = yield* Queue.bounded<number>(100);
  yield* Queue.offer(queue, 1); // Add 1 to the queue
  const value = yield* Queue.take(queue); // Retrieve and remove the oldest value
  return value;
});
Effect.runPromise(program).then(console.log); // Output: 1

// Creating a dropping queue with a capacity of 100
const droppingQueue2 = Queue.dropping<number>(100);

// Creating a sliding queue with a capacity of 100
const slidingQueue3 = Queue.sliding<number>(100);

// Creating an unbounded queue
const unboundedQueue4 = Queue.unbounded<number>();

const program2 = Effect.gen(function* () {
  const queue = yield* Queue.bounded<number>(100);
  yield* Queue.offer(queue, 1); // put 1 in the queue
});

const program3 = Effect.gen(function* () {
  const queue = yield* Queue.bounded<number>(1);
  yield* Queue.offer(queue, 1);
  const fiber = yield* Effect.fork(Queue.offer(queue, 2)); // will be suspended because the queue is full
  yield* Queue.take(queue);
  yield* Fiber.join(fiber);
});

const program4 = Effect.gen(function* () {
  const queue = yield* Queue.bounded<number>(100);
  const items = Array.range(1, 10);
  yield* Queue.offerAll(queue, items);
  return yield* Queue.size(queue);
});
Effect.runPromise(program4).then(console.log); // Output: 10

const oldestItem = Effect.gen(function* () {
  const queue = yield* Queue.bounded<string>(100);
  const fiber = yield* Effect.fork(Queue.take(queue)); // will be suspended because the queue is empty
  yield* Queue.offer(queue, 'something');
  const value = yield* Fiber.join(fiber);
  return value;
});
Effect.runPromise(oldestItem).then(console.log); // Output: something

const polled = Effect.gen(function* () {
  const queue = yield* Queue.bounded<number>(100);
  yield* Queue.offer(queue, 10);
  yield* Queue.offer(queue, 20);
  const head = yield* Queue.poll(queue);
  return head;
});
Effect.runPromise(polled).then(console.log);
/*
Output:
{
  _id: "Option",
  _tag: "Some",
  value: 10
}
*/

const polled2 = Effect.gen(function* () {
  const queue = yield* Queue.bounded<number>(100);
  yield* Queue.offer(queue, 10);
  yield* Queue.offer(queue, 20);
  yield* Queue.offer(queue, 30);
  const chunk = yield* Queue.takeUpTo(queue, 2);
  return chunk;
});
Effect.runPromise(polled2).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 10, 20 ]
}
*/

const polled3 = Effect.gen(function* () {
  const queue = yield* Queue.bounded<number>(100);
  yield* Queue.offer(queue, 10);
  yield* Queue.offer(queue, 20);
  yield* Queue.offer(queue, 30);
  const chunk = yield* Queue.takeAll(queue);
  return chunk;
});
Effect.runPromise(polled3).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 10, 20, 30 ]
}
*/

const program5 = Effect.gen(function* () {
  const queue = yield* Queue.bounded<number>(3);
  const fiber = yield* Effect.fork(Queue.take(queue));
  yield* Queue.shutdown(queue); // will interrupt fiber
  yield* Fiber.join(fiber); // will terminate
});

const program6 = Effect.gen(function* () {
  const queue = yield* Queue.bounded<number>(3);
  const fiber = yield* Effect.fork(
    Queue.awaitShutdown(queue).pipe(
      Effect.andThen(Console.log('shutting down'))
    )
  );
  yield* Queue.shutdown(queue);
  yield* Fiber.join(fiber);
});
Effect.runPromise(program6); // Output: shutting down

const send = (offerOnlyQueue: Queue.Enqueue<number>, value: number) => {
  // This enqueue can only be used to offer values
  // @ts-expect-error
  Queue.take(offerOnlyQueue);
  // Ok
  return Queue.offer(offerOnlyQueue, value);
};

const receive = (takeOnlyQueue: Queue.Dequeue<number>) => {
  // This dequeue can only be used to take values
  // @ts-expect-error
  Queue.offer(takeOnlyQueue, 1);
  // Ok
  return Queue.take(takeOnlyQueue);
};

const send7 = (offerOnlyQueue: Queue.Enqueue<number>, value: number) => {
  return Queue.offer(offerOnlyQueue, value);
};
const receive7 = (takeOnlyQueue: Queue.Dequeue<number>) => {
  return Queue.take(takeOnlyQueue);
};
const program7 = Effect.gen(function* () {
  const queue = yield* Queue.unbounded<number>();
  // Offer values to the queue
  yield* send7(queue, 1);
  yield* send7(queue, 2);
  // Take values from the queue
  console.log(yield* receive7(queue));
  console.log(yield* receive7(queue));
});
Effect.runPromise(program7);
/*
Output:
1
2
*/
