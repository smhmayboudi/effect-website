import {Stream, Sink, Effect} from 'effect';

const stream = Stream.make(1, 2, 3); // Define a stream with numbers 1, 2, and 3
const sink = Sink.sum; // Choose a sink that sums up numbers
const sum = Stream.run(stream, sink); // Run the stream through the sink
Effect.runPromise(sum).then(console.log);
/*
Output:
6
*/
