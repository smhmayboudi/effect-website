import {Console, Effect, Schedule} from 'effect';
let count = 0;
// Simulates an effect with possible failures
export const effect = Effect.async<string, Error>(resume => {
  if (count <= 2) {
    count++;
    console.log('failure');
    resume(Effect.fail(new Error()));
  } else {
    console.log('success');
    resume(Effect.succeed('yay!'));
  }
});

// Define a repetition policy using a fixed delay between retries
const policy = Schedule.fixed('100 millis');

const repeated = Effect.retry(effect, policy);

Effect.runPromise(repeated).then(console.log);
/*
Output:
failure
failure
failure
success
yay!
*/

Effect.runPromise(Effect.retry(effect, {times: 5}));
/*
Output:
failure
failure
failure
success
*/

const policy2 = Schedule.addDelay(
  Schedule.recurs(2), // Retry for a maximum of 2 times
  () => '100 millis' // Add a delay of 100 milliseconds between retries
);
// Create a new effect that retries the effect with the specified policy2,
// and provides a fallback effect if all retries fail
const repeated2 = Effect.retryOrElse(effect, policy2, () =>
  Console.log('orElse').pipe(Effect.as('default value'))
);
Effect.runPromise(repeated2).then(console.log);
/*
Output:
failure
failure
failure
orElse
default value
*/
