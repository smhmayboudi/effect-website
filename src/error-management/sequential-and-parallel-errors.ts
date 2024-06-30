import {Effect} from 'effect';

const fail = Effect.fail('Oh uh!');
const die = Effect.dieMessage('Boom!');
const program = Effect.all([fail, die]).pipe(
  Effect.andThen(die),
  Effect.asVoid
);
Effect.runPromiseExit(program).then(console.log);
/*
Output:
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Fail', failure: 'Oh uh!' }
}
*/

const fail2 = Effect.fail('Oh uh!');
const die2 = Effect.dieMessage('Boom!');

const program2 = Effect.all([fail2, die2], {concurrency: 'unbounded'}).pipe(
  Effect.asVoid
);

Effect.runPromiseExit(program2).then(console.log);
/*
Output:
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: {
    _id: 'Cause',
    _tag: 'Parallel',
    left: { _id: 'Cause', _tag: 'Fail', failure: 'Oh uh!' },
    right: { _id: 'Cause', _tag: 'Die', defect: [Object] }
  }
}
*/

const fail13 = Effect.fail('Oh uh!');
const fail23 = Effect.fail('Oh no!');
const die3 = Effect.dieMessage('Boom!');

const program3 = Effect.all([fail13, fail23, die3], {
  concurrency: 'unbounded',
}).pipe(Effect.asVoid, Effect.parallelErrors);

Effect.runPromiseExit(program3).then(console.log);
/*
Output:
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Fail', failure: [ 'Oh uh!', 'Oh no!' ] }
}
*/

const fail4 = Effect.fail('Oh uh!');
const die4 = Effect.dieMessage('Boom!');

const program4 = fail4.pipe(Effect.ensuring(die4));

Effect.runPromiseExit(program4).then(console.log);
/*
Output:
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: {
    _id: 'Cause',
    _tag: 'Sequential',
    left: { _id: 'Cause', _tag: 'Fail', failure: 'Oh uh!' },
    right: { _id: 'Cause', _tag: 'Die', defect: [Object] }
  }
}
*/
