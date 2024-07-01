import {NodeRuntime} from '@effect/platform-node';
import {Console, Effect, Schedule} from 'effect';

const getJson = (url: string) =>
  Effect.tryPromise(() =>
    fetch(url).then(res => {
      if (!res.ok) {
        console.log('error');
        throw new Error(res.statusText);
      }
      console.log('ok');
      return res.json() as unknown;
    })
  );
const program = (url: string) =>
  getJson(url).pipe(
    Effect.retry({times: 2}),
    Effect.timeout('4 seconds'),
    Effect.catchAll(Console.error)
  );
// testing the happy path
NodeRuntime.runMain(program('https://dummyjson.com/products/1?delay=1000'));
/*
Output:
ok
*/
// testing the timeout
// NodeRuntime.runMain(program("https://dummyjson.com/products/1?delay=5000"))
/*
Output:
TimeoutException
*/
// testing API errors
// NodeRuntime.runMain(
//   program("https://dummyjson.com/auth/products/1?delay=500")
// )
/*
Output:
error
error
error
UnknownException: Forbidden
*/

class Err extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}
const getJson2 = (url: string) =>
  Effect.tryPromise({
    try: () =>
      fetch(url).then(res => {
        if (!res.ok) {
          console.log(res.status);
          throw new Err(res.statusText, res.status);
        }
        return res.json() as unknown;
      }),
    catch: e => e as Err,
  });
const program2 = (url: string) =>
  getJson2(url).pipe(
    // Retry if the error is a 403
    Effect.retry({while: err => err.status === 403}),
    Effect.catchAll(Console.error)
  );
// testing 403
NodeRuntime.runMain(
  program2('https://dummyjson.com/auth/products/1?delay=1000')
);
/*
Output:
403
403
403
403
...
*/
// testing 404
// NodeRuntime.runMain(program("https://dummyjson.com/-"))
/*
Output:
404
Err [Error]: Not Found
*/

const longRunningEffect = Console.log('done').pipe(Effect.delay('5 seconds'));
const action = Console.log('action...');
const schedule = Schedule.fixed('1.5 seconds');
const program3 = Effect.race(
  Effect.repeat(action, schedule),
  longRunningEffect
);
Effect.runPromise(program3);
/*
Output:
action...
action...
action...
action...
done
*/
