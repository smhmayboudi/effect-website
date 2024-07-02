import {
  Chunk,
  Console,
  Context,
  Effect,
  Option,
  Random,
  Schedule,
  Stream,
  StreamEmit,
} from 'effect';

const stream = Stream.make(1, 2, 3);

const stream2 = Stream.empty;

const stream3 = Stream.void;

// Creating a stream of numbers from 1 to 5
const stream4 = Stream.range(1, 5); // Produces 1, 2, 3, 4, 5

// Creating a stream of incrementing numbers
const stream5 = Stream.iterate(1, n => n + 1); // Produces 1, 2, 3, ...

// Creating a single-valued stream from a scoped resource
const stream6 = Stream.scoped(
  Effect.acquireUseRelease(
    Console.log('acquire'),
    () => Console.log('use'),
    () => Console.log('release')
  )
);

// Creating a stream that can emit errors
const streamWithError: Stream.Stream<never, string> = Stream.fail('Uh oh!');

// Creating a stream that emits a numeric value
const streamWithNumber: Stream.Stream<number> = Stream.succeed(5);

// Creating a stream with values from a single Chunk
const stream7 = Stream.fromChunk(Chunk.make(1, 2, 3));

// Creating a stream with values from multiple Chunks
const stream8 = Stream.fromChunks(Chunk.make(1, 2, 3), Chunk.make(4, 5, 6));

const stream9 = Stream.fromEffect(Random.nextInt);

const events = [1, 2, 3, 4];
const stream10 = Stream.async(
  (emit: StreamEmit.Emit<never, never, number, void>) => {
    events.forEach(n => {
      setTimeout(() => {
        if (n === 3) {
          emit(Effect.fail(Option.none())); // Terminate the stream
        } else {
          emit(Effect.succeed(Chunk.of(n))); // Add the current item to the stream
        }
      }, 100 * n);
    });
  }
);
Effect.runPromise(Stream.runCollect(stream)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 1, 2 ]
}
*/

const numbers = [1, 2, 3];
const stream11 = Stream.fromIterable(numbers);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface User {}
class Database extends Context.Tag('Database')<
  Database,
  {readonly getUsers: Effect.Effect<Array<User>>}
>() {}
const getUsers = Database.pipe(Effect.andThen(_ => _.getUsers));
const users = Stream.fromIterableEffect(getUsers);

const myAsyncIterable = async function* () {
  yield 1;
  yield 2;
};
const stream12 = Stream.fromAsyncIterable(
  myAsyncIterable(),
  e => new Error(String(e)) // Error Handling
);

const repeatZero = Stream.repeatValue(0);

// Creating a stream that repeats a value indefinitely
const repeatingStream = Stream.repeat(Stream.succeed(1), Schedule.forever);

const randomNumbers = Stream.repeatEffect(Random.nextInt);

const drainIterator = <A>(it: Iterator<A>): Stream.Stream<A> =>
  Stream.repeatEffectOption(
    Effect.sync(() => it.next()).pipe(
      Effect.andThen(res => {
        if (res.done) {
          return Effect.fail(Option.none());
        }
        return Effect.succeed(res.value);
      })
    )
  );

const stream13 = Stream.tick('2 seconds');

const nats = Stream.unfold(1, n => Option.some([n, n + 1]));

const ints = Stream.unfoldEffect(1, n =>
  Random.nextBoolean.pipe(
    Effect.map(b => (b ? Option.some([n, -n]) : Option.some([n, n])))
  )
);

const stream14 = Stream.paginate(0, n => [
  n,
  n < 3 ? Option.some(n + 1) : Option.none(),
]);

// Emits values every 1 second for a total of 10 emissions
const schedule = Schedule.spaced('1 second').pipe(
  Schedule.compose(Schedule.recurs(10))
);
const stream15 = Stream.fromSchedule(schedule);
Effect.runPromise(Stream.runCollect(stream15)).then(console.log);
/*
Output:
{
  _id: "Chunk",
  values: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
}
*/
