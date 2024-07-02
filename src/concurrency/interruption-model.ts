import {Effect} from 'effect';

const program = Effect.gen(function* () {
  yield* Effect.log('start');
  yield* Effect.sleep('2 seconds');
  yield* Effect.log('done');
});
Effect.runPromise(program).catch(error => console.log(`interrupted: ${error}`));
/*
Output:
timestamp=... level=INFO fiber=#0 message=start
timestamp=... level=INFO fiber=#0 message=done
*/

const program2 = Effect.log('start').pipe(
  Effect.andThen(Effect.sleep('2 seconds')),
  Effect.andThen(Effect.log('done'))
);
Effect.runPromise(program2).catch(error =>
  console.log(`interrupted: ${error}`)
);
/*
Output:
timestamp=... level=INFO fiber=#0 message=start
timestamp=... level=INFO fiber=#0 message=done
*/

const program3 = Effect.gen(function* () {
  yield* Effect.log('start');
  yield* Effect.sleep('2 seconds');
  yield* Effect.interrupt;
  yield* Effect.log('done');
});
Effect.runPromiseExit(program3).then(console.log);
/*
Output:
timestamp=... level=INFO fiber=#0 message=start
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: {
    _id: 'Cause',
    _tag: 'Interrupt',
    fiberId: {
      _id: 'FiberId',
      _tag: 'Runtime',
      id: 0,
      startTimeMillis: ...
    }
  }
}
*/

const program4 = Effect.log('start').pipe(
  Effect.andThen(Effect.sleep('2 seconds')),
  Effect.andThen(Effect.interrupt),
  Effect.andThen(Effect.log('done'))
);
Effect.runPromiseExit(program4).then(console.log);
/*
Output:
timestamp=... level=INFO fiber=#0 message=start
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: {
    _id: 'Cause',
    _tag: 'Interrupt',
    fiberId: {
      _id: 'FiberId',
      _tag: 'Runtime',
      id: 0,
      startTimeMillis: ...
    }
  }
}
*/

const program5 = Effect.forEach(
  [1, 2, 3],
  n =>
    Effect.gen(function* () {
      yield* Effect.log(`start #${n}`);
      yield* Effect.sleep(`${n} seconds`);
      if (n > 1) {
        yield* Effect.interrupt;
      }
      yield* Effect.log(`done #${n}`);
    }),
  {concurrency: 'unbounded'}
);
Effect.runPromiseExit(program5).then(exit =>
  console.log(JSON.stringify(exit, null, 2))
);
/*
Output:
timestamp=... level=INFO fiber=#1 message="start #1"
timestamp=... level=INFO fiber=#2 message="start #2"
timestamp=... level=INFO fiber=#3 message="start #3"
timestamp=... level=INFO fiber=#1 message="done #1"
{
  "_id": "Exit",
  "_tag": "Failure",
  "cause": {
    "_id": "Cause",
    "_tag": "Parallel",
    "left": {
      "_id": "Cause",
      "_tag": "Interrupt",
      "fiberId": {
        "_id": "FiberId",
        "_tag": "Runtime",
        "id": 3,
        "startTimeMillis": ...
      }
    },
    "right": {
      "_id": "Cause",
      "_tag": "Sequential",
      "left": {
        "_id": "Cause",
        "_tag": "Empty"
      },
      "right": {
        "_id": "Cause",
        "_tag": "Interrupt",
        "fiberId": {
          "_id": "FiberId",
          "_tag": "Runtime",
          "id": 0,
          "startTimeMillis": ...
        }
      }
    }
  }
}
*/

const program6 = Effect.forEach(
  [1, 2, 3],
  n =>
    Effect.log(`start #${n}`).pipe(
      Effect.andThen(() => {
        const effect = Effect.sleep(`${n} seconds`);
        if (n > 1) {
          return Effect.andThen(effect, () => Effect.interrupt);
        } else {
          return effect;
        }
      }),
      Effect.andThen(Effect.log(`done #${n}`))
    ),
  {concurrency: 'unbounded'}
);
Effect.runPromiseExit(program6).then(exit =>
  console.log(JSON.stringify(exit, null, 2))
);
/*
Output:
timestamp=... level=INFO fiber=#1 message="start #1"
timestamp=... level=INFO fiber=#2 message="start #2"
timestamp=... level=INFO fiber=#3 message="start #3"
timestamp=... level=INFO fiber=#1 message="done #1"
{
  "_id": "Exit",
  "_tag": "Failure",
  "cause": {
    "_id": "Cause",
    "_tag": "Parallel",
    "left": {
      "_id": "Cause",
      "_tag": "Interrupt",
      "fiberId": {
        "_id": "FiberId",
        "_tag": "Runtime",
        "id": 3,
        "startTimeMillis": ...
      }
    },
    "right": {
      "_id": "Cause",
      "_tag": "Sequential",
      "left": {
        "_id": "Cause",
        "_tag": "Empty"
      },
      "right": {
        "_id": "Cause",
        "_tag": "Interrupt",
        "fiberId": {
          "_id": "FiberId",
          "_tag": "Runtime",
          "id": 0,
          "startTimeMillis": ...
        }
      }
    }
  }
}
*/
