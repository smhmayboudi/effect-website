import {Effect, Chunk, Option, Stream} from 'effect';

// An Effect that fails with a string error
const failedEffect = Effect.fail('fail!');
// An Effect that produces a single number
const oneNumberValue = Effect.succeed(3);
// An Effect that produces a chunk of numbers
const oneListValue = Effect.succeed(Chunk.make(1, 2, 3));
// An Effect that produces an optional number
const oneOption = Effect.succeed(Option.some(1));

// An empty Stream
const emptyStream = Stream.empty;
// A Stream with a single number
const oneNumberValueStream = Stream.succeed(3);
// A Stream with a range of numbers from 1 to 10
const finiteNumberStream = Stream.range(1, 10);
// An infinite Stream of numbers starting from 1 and incrementing
const infiniteNumberStream = Stream.iterate(1, n => n + 1);
