import {Console, Effect} from 'effect';
import {constVoid} from 'effect/Function';

const success: Effect.Effect<number, Error> = Effect.succeed(42);
const failure: Effect.Effect<number, Error> = Effect.fail(new Error('Uh oh!'));
const program1 = Effect.match(success, {
  onFailure: error => `failure: ${error.message}`,
  onSuccess: value => `success: ${value}`,
});
Effect.runPromise(program1).then(console.log); // Output: "success: 42"
const program2 = Effect.match(failure, {
  onFailure: error => `failure: ${error.message}`,
  onSuccess: value => `success: ${value}`,
});
Effect.runPromise(program2).then(console.log); // Output: "failure: Uh oh!"

const task = Effect.fail('Uh oh!').pipe(Effect.as(5));

const program3 = Effect.match(task, {
  onFailure: constVoid,
  onSuccess: constVoid,
});

const task2 = Effect.fail('Uh oh!').pipe(Effect.as(5));

const program4 = Effect.ignore(task2);

const success2: Effect.Effect<number, Error> = Effect.succeed(42);
const failure2: Effect.Effect<number, Error> = Effect.fail(new Error('Uh oh!'));

const program5 = Effect.matchEffect(success2, {
  onFailure: error =>
    Effect.succeed(`failure: ${error.message}`).pipe(Effect.tap(Effect.log)),
  onSuccess: value =>
    Effect.succeed(`success: ${value}`).pipe(Effect.tap(Effect.log)),
});

console.log(Effect.runSync(program5));
/*
Output:
... message="success: 42"
success: 42
*/

const program6 = Effect.matchEffect(failure, {
  onFailure: error =>
    Effect.succeed(`failure: ${error.message}`).pipe(Effect.tap(Effect.log)),
  onSuccess: value =>
    Effect.succeed(`success: ${value}`).pipe(Effect.tap(Effect.log)),
});

console.log(Effect.runSync(program6));
/*
Output:
... message="failure: Uh oh!"
failure: Uh oh!
*/

declare const exceptionalEffect: Effect.Effect<void, Error>;

const program7 = Effect.matchCauseEffect(exceptionalEffect, {
  onFailure: cause => {
    switch (cause._tag) {
      case 'Fail':
        return Console.log(`Fail: ${cause.error.message}`);
      case 'Die':
        return Console.log(`Die: ${cause.defect}`);
      case 'Interrupt':
        return Console.log(`${cause.fiberId} interrupted!`);
    }
    return Console.log('failed due to other causes');
  },
  onSuccess: value => Console.log(`succeeded with ${value} value`),
});
