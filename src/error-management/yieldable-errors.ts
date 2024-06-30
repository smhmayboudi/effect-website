import {Effect, Data, Random} from 'effect';

class MyError extends Data.Error<{message: string}> {}
export const program = Effect.gen(function* () {
  yield* new MyError({message: 'Oh no!'}); // same as yield* Effect.fail(new MyError({ message: "Oh no!" })
});
Effect.runPromiseExit(program).then(console.log);
/*
Output:
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Fail', failure: { message: 'Oh no!' } }
}
*/

// An error with _tag: "Foo"
class FooError extends Data.TaggedError('Foo')<{
  message: string;
}> {}

// An error with _tag: "Bar"
class BarError extends Data.TaggedError('Bar')<{
  randomNumber: number;
}> {}

export const program2 = Effect.gen(function* () {
  const n = yield* Random.next;
  return n > 0.5
    ? 'yay!'
    : n < 0.2
      ? yield* new FooError({message: 'Oh no!'})
      : yield* new BarError({randomNumber: n});
}).pipe(
  Effect.catchTags({
    Foo: error => Effect.succeed(`Foo error: ${error.message}`),
    Bar: error => Effect.succeed(`Bar error: ${error.randomNumber}`),
  })
);

Effect.runPromise(program2).then(console.log, console.error);
/*
Example Output (n < 0.2):
Foo error: Oh no!
*/
