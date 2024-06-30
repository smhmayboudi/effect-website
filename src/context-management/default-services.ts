import {Effect, Clock, Console} from 'effect';

const program = Effect.gen(function* () {
  const now = yield* Clock.currentTimeMillis;
  yield* Console.log(`Application started at ${new Date(now)}`);
});
