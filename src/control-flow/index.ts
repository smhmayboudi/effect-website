import {Console, Effect, Option, Random} from 'effect';

const validateWeightOption = (
  weight: number
): Effect.Effect<Option.Option<number>> => {
  if (weight >= 0) {
    return Effect.succeed(Option.some(weight));
  } else {
    return Effect.succeed(Option.none());
  }
};

const validateWeightOrFail = (
  weight: number
): Effect.Effect<number, string> => {
  if (weight >= 0) {
    return Effect.succeed(weight);
  } else {
    return Effect.fail(`negative input: ${weight}`);
  }
};

const validateWeightOption2 = (
  weight: number
): Effect.Effect<Option.Option<number>> =>
  Effect.succeed(weight).pipe(Effect.when(() => weight >= 0));

Effect.runPromise(validateWeightOption2(100)).then(console.log);
/*
Output:
{
  _id: "Option",
  _tag: "Some",
  value: 100
}
*/
Effect.runPromise(validateWeightOption2(-5)).then(console.log);
/*
Output:
{
  _id: "Option",
  _tag: "None"
}
*/

const randomIntOption = Random.nextInt.pipe(
  Effect.whenEffect(Random.nextBoolean)
);

const flipTheCoin = Effect.if(Random.nextBoolean, {
  onTrue: () => Console.log('Head'),
  onFalse: () => Console.log('Tail'),
});
Effect.runPromise(flipTheCoin);

const task1 = Effect.succeed(1).pipe(
  Effect.delay('200 millis'),
  Effect.tap(Effect.log('task1 done'))
);
const task2 = Effect.succeed('hello').pipe(
  Effect.delay('100 millis'),
  Effect.tap(Effect.log('task2 done'))
);
const task3 = Effect.zip(task1, task2);
Effect.runPromise(task3).then(console.log);
/*
Output:
timestamp=... level=INFO fiber=#0 message="task1 done"
timestamp=... level=INFO fiber=#0 message="task2 done"
[ 1, 'hello' ]
*/

const task4 = Effect.zip(task1, task2, {concurrent: true});
Effect.runPromise(task4).then(console.log);
/*
Output:
timestamp=... level=INFO fiber=#3 message="task2 done"
timestamp=... level=INFO fiber=#2 message="task1 done"
[ 1, 'hello' ]
*/

const task51 = Effect.succeed(1).pipe(
  Effect.delay('200 millis'),
  Effect.tap(Effect.log('task51 done'))
);
const task52 = Effect.succeed('hello').pipe(
  Effect.delay('100 millis'),
  Effect.tap(Effect.log('task52 done'))
);
const task53 = Effect.zipWith(
  task51,
  task52,
  (number, string) => number + string.length
);
Effect.runPromise(task53).then(console.log);
/*
Output:
timestamp=... level=INFO fiber=#3 message="task1 done"
timestamp=... level=INFO fiber=#2 message="task2 done"
6
*/

const result = Effect.loop(
  1, // Initial state
  {
    while: state => state <= 5, // Condition to continue looping
    step: state => state + 1, // State update function
    body: state => Effect.succeed(state), // Effect to be performed on each iteration
  }
);
Effect.runPromise(result).then(console.log); // Output: [1, 2, 3, 4, 5]

const result2 = Effect.loop(
  1, // Initial state
  {
    while: state => state <= 5, // Condition to continue looping,
    step: state => state + 1, // State update function,
    body: state => Console.log(`Currently at state ${state}`), // Effect to be performed on each iteration,
    discard: true,
  }
);
Effect.runPromise(result2).then(console.log);
/*
Output:
Currently at state 1
Currently at state 2
Currently at state 3
Currently at state 4
Currently at state 5
undefined
*/

const result3 = Effect.iterate(
  1, // Initial result
  {
    while: result => result <= 5, // Condition to continue iterating
    body: result => Effect.succeed(result + 1), // Operation to change the result
  }
);
Effect.runPromise(result).then(console.log); // Output: 6

const result4 = Effect.forEach([1, 2, 3, 4, 5], (n, index) =>
  Console.log(`Currently at index ${index}`).pipe(Effect.as(n * 2))
);
Effect.runPromise(result).then(console.log);
/*
Output:
Currently at index 0
Currently at index 1
Currently at index 2
Currently at index 3
Currently at index 4
[ 2, 4, 6, 8, 10 ]
*/

const result5 = Effect.forEach(
  [1, 2, 3, 4, 5],
  (n, index) =>
    Console.log(`Currently at index ${index}`).pipe(Effect.as(n * 2)),
  {discard: true}
);
Effect.runPromise(result).then(console.log);
/*
Output:
Currently at index 0
Currently at index 1
Currently at index 2
Currently at index 3
Currently at index 4
undefined
*/

const tuple = [
  Effect.succeed(42).pipe(Effect.tap(Console.log)),
  Effect.succeed('Hello').pipe(Effect.tap(Console.log)),
] as const;
const combinedEffect = Effect.all(tuple);
Effect.runPromise(combinedEffect).then(console.log);
/*
Output:
42
Hello
[ 42, 'Hello' ]
*/

const iterable: Iterable<Effect.Effect<number>> = [1, 2, 3].map(n =>
  Effect.succeed(n).pipe(Effect.tap(Console.log))
);
const combinedEffect2 = Effect.all(iterable);
Effect.runPromise(combinedEffect2).then(console.log);
/*
Output:
1
2
3
[ 1, 2, 3 ]
*/

const struct = {
  a: Effect.succeed(42).pipe(Effect.tap(Console.log)),
  b: Effect.succeed('Hello').pipe(Effect.tap(Console.log)),
};
const combinedEffect3 = Effect.all(struct);
Effect.runPromise(combinedEffect3).then(console.log);
/*
Output:
42
Hello
{ a: 42, b: 'Hello' }
*/

const record: Record<string, Effect.Effect<number>> = {
  key1: Effect.succeed(1).pipe(Effect.tap(Console.log)),
  key2: Effect.succeed(2).pipe(Effect.tap(Console.log)),
};
const combinedEffect4 = Effect.all(record);
Effect.runPromise(combinedEffect4).then(console.log);
/*
Output:
1
2
{ key1: 1, key2: 2 }
*/

const effects = [
  Effect.succeed('Task1').pipe(Effect.tap(Console.log)),
  Effect.fail('Task2: Oh no!').pipe(Effect.tap(Console.log)),
  Effect.succeed('Task3').pipe(Effect.tap(Console.log)), // this task won't be executed
];
const program = Effect.all(effects);
Effect.runPromiseExit(program).then(console.log);
/*
Output:
Task1
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Fail', failure: 'Task2: Oh no!' }
}
*/

const effects2 = [
  Effect.succeed('Task1').pipe(Effect.tap(Console.log)),
  Effect.fail('Task2: Oh no!').pipe(Effect.tap(Console.log)),
  Effect.succeed('Task3').pipe(Effect.tap(Console.log)),
];
const program2 = Effect.all(effects2, {mode: 'either'});
Effect.runPromiseExit(program2).then(console.log);
/*
Output:
Task1
Task3
{
  _id: 'Exit',
  _tag: 'Success',
  value: [
    { _id: 'Either', _tag: 'Right', right: 'Task1' },
    { _id: 'Either', _tag: 'Left', left: 'Task2: Oh no!' },
    { _id: 'Either', _tag: 'Right', right: 'Task3' }
  ]
}
*/

const effects3 = [
  Effect.succeed('Task1').pipe(Effect.tap(Console.log)),
  Effect.fail('Task2: Oh no!').pipe(Effect.tap(Console.log)),
  Effect.succeed('Task3').pipe(Effect.tap(Console.log)),
];
const program3 = Effect.all(effects3, {mode: 'validate'});
Effect.runPromiseExit(program3).then(result => console.log('%o', result));
/*
Output:
Task1
Task3
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: {
    _id: 'Cause',
    _tag: 'Fail',
    failure: [
      { _id: 'Option', _tag: 'None' },
      { _id: 'Option', _tag: 'Some', value: 'Task2: Oh no!' },
      { _id: 'Option', _tag: 'None' }
    ]
  }
}
*/
