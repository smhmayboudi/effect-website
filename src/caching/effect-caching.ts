import {Console, Effect, Random} from 'effect';

const program = Effect.gen(function* () {
  const randomNumber = (n: number) => Random.nextIntBetween(1, n);
  console.log('non-memoized version:');
  console.log(yield* randomNumber(10));
  console.log(yield* randomNumber(10));
  console.log('memoized version:');
  const memoized = yield* Effect.cachedFunction(randomNumber);
  console.log(yield* memoized(10));
  console.log(yield* memoized(10));
});
Effect.runFork(program);
/*
Example Output:
non-memoized version:
2
8
memoized version:
5
5
*/

const program2 = Effect.gen(function* () {
  const task1 = Console.log('task1');
  yield* Effect.repeatN(task1, 2);
  const task2 = yield* Effect.once(Console.log('task2'));
  yield* Effect.repeatN(task2, 2);
});
Effect.runFork(program2);
/*
Output:
task1
task1
task1
task2
*/

let i3 = 1;
const expensiveTask = Effect.promise<string>(() => {
  console.log('expensive task...');
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`result ${i3++}`);
    }, 100);
  });
});
const program3 = Effect.gen(function* () {
  console.log('non-cached version:');
  yield* expensiveTask.pipe(Effect.andThen(Console.log));
  yield* expensiveTask.pipe(Effect.andThen(Console.log));
  console.log('cached version:');
  const cached3 = yield* Effect.cached(expensiveTask);
  yield* cached3.pipe(Effect.andThen(Console.log));
  yield* cached3.pipe(Effect.andThen(Console.log));
});
Effect.runFork(program3);
/*
Output:
non-cached version:
expensive task...
result 1
expensive task...
result 2
cached version:
expensive task...
result 3
result 3
*/

let i4 = 1;
const expensiveTask4 = Effect.promise<string>(() => {
  console.log('expensive task...');
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`result ${i4++}`);
    }, 100);
  });
});
const program4 = Effect.gen(function* () {
  const cached = yield* Effect.cachedWithTTL(expensiveTask4, '150 millis');
  yield* cached.pipe(Effect.andThen(Console.log));
  yield* cached.pipe(Effect.andThen(Console.log));
  yield* Effect.sleep('100 millis');
  yield* cached.pipe(Effect.andThen(Console.log));
});
Effect.runFork(program4);
/*
Output:
expensive task...
result 1
result 1
expensive task...
result 2
*/

let i5 = 1;
const expensiveTask5 = Effect.promise<string>(() => {
  console.log('expensive task...');
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`result ${i5++}`);
    }, 100);
  });
});
const program5 = Effect.gen(function* () {
  const [cached, invalidate] = yield* Effect.cachedInvalidateWithTTL(
    expensiveTask5,
    '1 hour'
  );
  yield* cached.pipe(Effect.andThen(Console.log));
  yield* cached.pipe(Effect.andThen(Console.log));
  yield* invalidate;
  yield* cached.pipe(Effect.andThen(Console.log));
});
Effect.runFork(program5);
/*
Output:
expensive task...
result 1
result 1
expensive task...
result 2
*/
