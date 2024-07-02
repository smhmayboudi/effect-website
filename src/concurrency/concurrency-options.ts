import {Effect, Duration} from 'effect';
const makeTask = (n: number, delay: Duration.DurationInput) =>
  Effect.promise(
    () =>
      new Promise<void>(resolve => {
        console.log(`start task${n}`);
        setTimeout(() => {
          console.log(`task${n} done`);
          resolve();
        }, Duration.toMillis(delay));
      })
  );
const task1 = makeTask(1, '200 millis');
const task2 = makeTask(2, '100 millis');
const sequential = Effect.all([task1, task2]);
Effect.runPromise(sequential);
/*
Output:
start task1
task1 done
start task2 <-- task2 starts only after task1 completes
task2 done
*/

const task21 = makeTask(21, '200 millis');
const task22 = makeTask(22, '100 millis');
const task23 = makeTask(23, '210 millis');
const task24 = makeTask(24, '110 millis');
const task25 = makeTask(25, '150 millis');
const number2 = Effect.all([task21, task22, task23, task24, task25], {
  concurrency: 2,
});
Effect.runPromise(number2);
/*
Output:
start task1
start task2 <-- active tasks: task1, task2
task2 done
start task3 <-- active tasks: task1, task3
task1 done
start task4 <-- active tasks: task3, task4
task4 done
start task5 <-- active tasks: task3, task5
task3 done
task5 done
*/

const task31 = makeTask(31, '200 millis');
const task32 = makeTask(32, '100 millis');
const task33 = makeTask(33, '210 millis');
const task34 = makeTask(34, '110 millis');
const task35 = makeTask(35, '150 millis');
const unbounded3 = Effect.all([task31, task32, task33, task34, task35], {
  concurrency: 'unbounded',
});

Effect.runPromise(unbounded3);
/*
Output:
start task1
start task2
start task3
start task4
start task5
task2 done
task4 done
task5 done
task1 done
task3 done
*/

const task61 = makeTask(61, '200 millis');
const task62 = makeTask(62, '100 millis');
const task63 = makeTask(63, '210 millis');
const task64 = makeTask(64, '110 millis');
const task65 = makeTask(65, '150 millis');
const inherit6 = Effect.all([task61, task62, task63, task64, task65], {
  concurrency: 'inherit',
});
Effect.runPromise(inherit6);
/*
Output:
start task1
start task2
start task3
start task4
start task5
task2 done
task4 done
task5 done
task1 done
task3 done
*/

const task71 = makeTask(71, '200 millis');
const task72 = makeTask(72, '100 millis');
const task73 = makeTask(73, '210 millis');
const task74 = makeTask(74, '110 millis');
const task75 = makeTask(75, '150 millis');
const inherit = Effect.all([task71, task72, task73, task74, task75], {
  concurrency: 'inherit',
});
const withConcurrency7 = inherit.pipe(Effect.withConcurrency(2));
Effect.runPromise(withConcurrency7);
/*
Output:
start task1
start task2 <-- active tasks: task1, task2
task2 done
start task3 <-- active tasks: task1, task3
task1 done
start task4 <-- active tasks: task3, task4
task4 done
start task5 <-- active tasks: task3, task5
task3 done
task5 done
*/
