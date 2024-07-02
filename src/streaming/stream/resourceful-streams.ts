import {Stream, Console, Effect} from 'effect';

// Simulating File operations
const open = (filename: string) =>
  Effect.gen(function* () {
    yield* Console.log(`Opening ${filename}`);
    return {
      getLines: Effect.succeed(['Line 1', 'Line 2', 'Line 3']),
      close: Console.log(`Closing ${filename}`),
    };
  });
const stream = Stream.acquireRelease(open('file.txt'), file => file.close).pipe(
  Stream.flatMap(file => file.getLines)
);
Effect.runPromise(Stream.runCollect(stream)).then(console.log);
/*
Output:
Opening file.txt
Closing file.txt
{
  _id: "Chunk",
  values: [
    [ "Line 1", "Line 2", "Line 3" ]
  ]
}
*/

const application = Stream.fromEffect(Console.log('Application Logic.'));
const deleteDir = (dir: string) => Console.log(`Deleting dir: ${dir}`);
const program = application.pipe(
  Stream.concat(
    Stream.finalizer(
      deleteDir('tmp').pipe(
        Effect.andThen(Console.log('Temporary directory was deleted.'))
      )
    )
  )
);
Effect.runPromise(Stream.runCollect(program)).then(console.log);
/*
Output:
Application Logic.
Deleting dir: tmp
Temporary directory was deleted.
{
  _id: "Chunk",
  values: [ undefined, undefined ]
}
*/

const program2 = Stream.fromEffect(Console.log('Application Logic.')).pipe(
  Stream.concat(Stream.finalizer(Console.log('Finalizing the stream'))),
  Stream.ensuring(
    Console.log("Doing some other works after stream's finalization")
  )
);
Effect.runPromise(Stream.runCollect(program2)).then(console.log);
/*
Output:
Application Logic.
Finalizing the stream
Doing some other works after stream's finalization
{
  _id: "Chunk",
  values: [ undefined, undefined ]
}
*/
