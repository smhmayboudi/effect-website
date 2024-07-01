import {Effect, Cache, Duration} from 'effect';
import {type Cache as CacheT} from 'effect/Cache';

type Lookup<Key, Value, Error = never, Environment = never> = (
  key: Key
) => Effect.Effect<Value, Error, Environment>;

export declare const make: <
  Key,
  Value,
  Error = never,
  Environment = never,
>(options: {
  readonly capacity: number;
  readonly timeToLive: Duration.DurationInput;
  readonly lookup: Lookup<Key, Value, Error, Environment>;
}) => Effect.Effect<CacheT<Key, Value, Error>, never, Environment>;

const timeConsumingEffect = (key: string) =>
  Effect.sleep('2 seconds').pipe(Effect.as(key.length));
const program = Effect.gen(function* () {
  const cache = yield* Cache.make({
    capacity: 100,
    timeToLive: Duration.infinity,
    lookup: timeConsumingEffect,
  });
  const result = yield* cache
    .get('key1')
    .pipe(
      Effect.zip(cache.get('key1'), {concurrent: true}),
      Effect.zip(cache.get('key1'), {concurrent: true})
    );
  console.log(
    `Result of parallel execution of three effects with the same key: ${result}`
  );
  const hits = yield* cache.cacheStats.pipe(Effect.map(_ => _.hits));
  const misses = yield* cache.cacheStats.pipe(Effect.map(_ => _.misses));
  console.log(`Number of cache hits: ${hits}`);
  console.log(`Number of cache misses: ${misses}`);
});
Effect.runPromise(program);
/*
Output:
Result of parallel execution of three effects with the same key: 4,4,4
Number of cache hits: 2
Number of cache misses: 1
*/
