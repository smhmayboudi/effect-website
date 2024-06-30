import {Effect} from 'effect';

const task1 = Effect.succeed(1);
const task2 = Effect.fail('Oh uh!').pipe(Effect.as(2));
const task3 = Effect.succeed(3);
const task4 = Effect.fail('Oh no!').pipe(Effect.as(4));
const program = task1.pipe(
  Effect.zip(task2),
  Effect.zip(task3),
  Effect.zip(task4)
);
Effect.runPromise(program).then(console.log, console.error);
/*
Output:
(FiberFailure) Error: Oh uh!
*/

const program2 = Effect.forEach([1, 2, 3, 4, 5], n => {
  if (n < 4) {
    return Effect.succeed(n);
  } else {
    return Effect.fail(`${n} is not less that 4`);
  }
});

Effect.runPromise(program2).then(console.log, console.error);
/*
Output:
(FiberFailure) Error: 4 is not less that 4
*/

const task12 = Effect.succeed(1);
const task22 = Effect.fail('Oh uh!').pipe(Effect.as(2));
const task32 = Effect.succeed(3);
const task42 = Effect.fail('Oh no!').pipe(Effect.as(4));

const program3 = task12.pipe(
  Effect.validate(task22),
  Effect.validate(task32),
  Effect.validate(task42)
);

Effect.runPromise(program3).then(console.log, console.error);
/*
Output:
(FiberFailure) Error: Oh uh!
Error: Oh no!
*/

const program5 = Effect.validateAll([1, 2, 3, 4, 5], n => {
  if (n < 4) {
    return Effect.succeed(n);
  } else {
    return Effect.fail(`${n} is not less that 4`);
  }
});

Effect.runPromise(program5).then(console.log, console.error);
/*
Output:
(FiberFailure) Error: ["4 is not less that 4","5 is not less that 4"]
*/

const program6 = Effect.validateFirst([1, 2, 3, 4, 5], n => {
  if (n < 4) {
    return Effect.fail(`${n} is not less that 4`);
  } else {
    return Effect.succeed(n);
  }
});

Effect.runPromise(program6).then(console.log, console.error);
// Output: 4

const program7 = Effect.partition([0, 1, 2, 3, 4], n => {
  if (n % 2 === 0) {
    return Effect.succeed(n);
  } else {
    return Effect.fail(`${n} is not even`);
  }
});

Effect.runPromise(program7).then(console.log, console.error);
// Output: [ [ '1 is not even', '3 is not even' ], [ 0, 2, 4 ] ]
