import {Effect, Schedule, Console} from 'effect';

const action = Console.log('success');
const policy = Schedule.addDelay(Schedule.recurs(2), () => '100 millis');
const program = Effect.repeat(action, policy);
Effect.runPromise(program).then(n => console.log(`repetitions: ${n}`));
/*
Output:
success
success
success
repetitions: 2
*/

let count2 = 0;

// Define an async effect that simulates an action with possible failures
const action2 = Effect.async<string, string>(resume => {
  if (count2 > 1) {
    console.log('failure');
    resume(Effect.fail('Uh oh!'));
  } else {
    count2++;
    console.log('success');
    resume(Effect.succeed('yay!'));
  }
});
const policy2 = Schedule.addDelay(Schedule.recurs(2), () => '100 millis');
const program2 = Effect.repeat(action2, policy2);
// Effect.runPromiseExit(program2).then(console.log);
/*
Output:
success
success
failure
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Fail', failure: 'Uh oh!' }
}
*/

const action3 = Console.log('success');
const policy3 = Schedule.addDelay(Schedule.recurs(2), () => '100 millis');
const program3 = Effect.schedule(action3, policy3);
Effect.runPromise(program3).then(n => console.log(`repetitions: ${n}`));
/*
Output:
success
success
repetitions: 2
*/

const action4 = Console.log('success');
const program4 = Effect.repeatN(action4, 2);
Effect.runPromise(program4);

let count5 = 0;

// Define an async effect that simulates an action with possible failures
const action5 = Effect.async<string, string>(resume => {
  if (count5 > 1) {
    console.log('failure');
    resume(Effect.fail('Uh oh!'));
  } else {
    count5++;
    console.log('success');
    resume(Effect.succeed('yay!'));
  }
});

const policy5 = Schedule.addDelay(
  Schedule.recurs(2), // Repeat for a maximum of 2 times
  () => '100 millis' // Add a delay of 100 milliseconds between repetitions
);

const program5 = Effect.repeatOrElse(action5, policy5, () =>
  Effect.sync(() => {
    console.log('orElse');
    return count5 - 1;
  })
);

Effect.runPromise(program5).then(n => console.log(`repetitions: ${n}`));
/*
Output:
success
success
failure
orElse
repetitions: 1
*/
