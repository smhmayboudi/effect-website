import {Effect} from 'effect';

const task = Effect.gen(function* () {
  yield* Effect.log('1 start');
  yield* Effect.sleep('2 seconds');
  yield* Effect.log('1 end');
});
const semTask = (sem: Effect.Semaphore) => sem.withPermits(1)(task);
const semTaskSeq = (sem: Effect.Semaphore) =>
  [1, 2, 3].map(() => semTask(sem).pipe(Effect.withLogSpan('elapsed')));
const program = Effect.gen(function* () {
  const mutex = yield* Effect.makeSemaphore(1);
  yield* Effect.all(semTaskSeq(mutex), {concurrency: 'unbounded'});
});
Effect.runPromise(program);
/*
Output:
timestamp=... level=INFO fiber=#1 message=start elapsed=3ms
timestamp=... level=INFO fiber=#1 message=end elapsed=2010ms
timestamp=... level=INFO fiber=#2 message=start elapsed=2012ms
timestamp=... level=INFO fiber=#2 message=end elapsed=4017ms
timestamp=... level=INFO fiber=#3 message=start elapsed=4018ms
timestamp=... level=INFO fiber=#3 message=end elapsed=6026ms
*/

const program2 = Effect.gen(function* () {
  const sem = yield* Effect.makeSemaphore(5);

  yield* Effect.forEach(
    [1, 2, 3, 4, 5],
    n =>
      sem
        .withPermits(n)(
          Effect.delay(Effect.log(`2 process: ${n}`), '2 seconds')
        )
        .pipe(Effect.withLogSpan('elasped')),
    {concurrency: 'unbounded'}
  );
});
Effect.runPromise(program2);
/*
Output:
timestamp=... level=INFO fiber=#1 message="process: 1" elasped=2011ms
timestamp=... level=INFO fiber=#2 message="process: 2" elasped=2017ms
timestamp=... level=INFO fiber=#3 message="process: 3" elasped=4020ms
timestamp=... level=INFO fiber=#4 message="process: 4" elasped=6025ms
timestamp=... level=INFO fiber=#5 message="process: 5" elasped=8034ms
*/
