import {Cause, Effect, Either} from 'effect';

const myEffect = Effect.gen(function* () {
  console.log('Start processing...');
  yield* Effect.sleep('2 seconds'); // Simulates a delay in processing // Simulates a delay in processing
  console.log('Processing complete.');
  return 'Result';
});
// wraps this effect, setting a maximum allowable duration of 3 seconds
const timedEffect = myEffect.pipe(Effect.timeout('3 seconds'));
// Output will show that the task completes successfully
// as it falls within the timeout duration
Effect.runPromiseExit(timedEffect).then(console.log);
/*
Output:
Start processing...
Processing complete.
{ _id: 'Exit', _tag: 'Success', value: 'Result' }
*/

const myEffect2 = Effect.gen(function* () {
  console.log('Start processing...');
  yield* Effect.sleep('2 seconds'); // Simulates a delay in processing
  console.log('Processing complete.');
  return 'Result';
});

const timedEffect2 = myEffect2.pipe(Effect.timeout('1 second'));

Effect.runPromiseExit(timedEffect2).then(console.log);
/*
Output:
Start processing...
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Fail', failure: { _tag: 'TimeoutException' } }
}
*/

const myEffect3 = Effect.gen(function* () {
  console.log('Start processing...');
  yield* Effect.sleep('2 seconds'); // Simulates a delay in processing
  console.log('Processing complete.');
  return 'Result';
});

const timedEffect3 = myEffect3.pipe(
  Effect.uninterruptible,
  Effect.timeout('1 second')
);

// Outputs a TimeoutException after the task completes, because the task is uninterruptible
Effect.runPromiseExit(timedEffect3).then(console.log);
/*
Output:
Start processing...
Processing complete.
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Fail', failure: { _tag: 'TimeoutException' } }
}
*/

const longRunningTask4 = Effect.gen(function* () {
  console.log('Start heavy processing...');
  yield* Effect.sleep('5 seconds'); // Simulate a long process
  console.log('Heavy processing done.');
  return 'Data processed';
});

const timedEffect4 = longRunningTask4.pipe(
  Effect.uninterruptible,
  Effect.disconnect, // Allows the task to finish independently if it times out
  Effect.timeout('1 second')
);

Effect.runPromiseExit(timedEffect4).then(console.log);
/*
Output:
Start heavy processing...
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Fail', failure: { _tag: 'TimeoutException' } }
}
Heavy processing done.
*/

const myEffect5 = Effect.gen(function* () {
  console.log('Start processing...');
  yield* Effect.sleep('2 seconds'); // Simulates a delay in processing
  console.log('Processing complete.');
  return 'Result';
});

const main = myEffect5.pipe(
  Effect.timeoutTo({
    duration: '1 second',
    // let's return an Either
    onSuccess: (result): Either.Either<string, string> => Either.right(result),
    onTimeout: (): Either.Either<string, string> => Either.left('Timed out!'),
  })
);

Effect.runPromise(main).then(console.log);
/*
Output:
Start processing...
{
  _id: "Either",
  _tag: "Left",
  left: "Timed out!"
}
*/

const myEffect6 = Effect.gen(function* () {
  console.log('Start processing...');
  yield* Effect.sleep('2 seconds'); // Simulates a delay in processing
  console.log('Processing complete.');
  return 'Result';
});

class MyTimeoutError {
  readonly _tag = 'MyTimeoutError';
}

const main6 = myEffect6.pipe(
  Effect.timeoutFail({
    duration: '1 second',
    onTimeout: () => new MyTimeoutError(),
  })
);

Effect.runPromiseExit(main6).then(console.log);
/*
Output:
Start processing...
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: {
    _id: 'Cause',
    _tag: 'Fail',
    failure: MyTimeoutError { _tag: 'MyTimeoutError' }
  }
}
*/

const myEffect7 = Effect.gen(function* () {
  console.log('Start processing...');
  yield* Effect.sleep('2 seconds'); // Simulates a delay in processing
  console.log('Processing complete.');
  return 'Result';
});
const main7 = myEffect7.pipe(
  Effect.timeoutFailCause({
    duration: '1 second',
    onTimeout: () => Cause.die('Timed out!'),
  })
);
Effect.runPromiseExit(main7).then(console.log);
/*
Output:
Start processing...
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Die', defect: 'Timed out!' }
}
*/
