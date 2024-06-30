import {Effect, Context, Layer} from 'effect';
class A extends Context.Tag('A')<A, {readonly a: number}>() {}
class B extends Context.Tag('B')<B, {readonly b: string}>() {}
class C extends Context.Tag('C')<C, {readonly c: boolean}>() {}
const a = Layer.effect(
  A,
  Effect.succeed({a: 5}).pipe(Effect.tap(() => Effect.log('initialized')))
);
const b = Layer.effect(
  B,
  Effect.gen(function* () {
    const {a} = yield* A;
    return {b: String(a)};
  })
);
const c = Layer.effect(
  C,
  Effect.gen(function* () {
    const {a} = yield* A;
    return {c: a > 0};
  })
);
const program = Effect.gen(function* () {
  yield* B;
  yield* C;
});
const runnable = Effect.provide(
  program,
  Layer.merge(Layer.provide(b, a), Layer.provide(c, a))
);
Effect.runPromise(runnable);
/*
Output:
timestamp=... level=INFO fiber=#2 message=initialized
*/

const runnable2 = Effect.provide(
  program,
  Layer.merge(
    Layer.provide(b, Layer.fresh(a)),
    Layer.provide(c, Layer.fresh(a))
  )
);
Effect.runPromise(runnable);
/*
Output:
timestamp=... level=INFO fiber=#2 message=initialized
timestamp=... level=INFO fiber=#3 message=initialized
*/

class A2 extends Context.Tag('A')<A, {readonly a: number}>() {}
const a2 = Layer.effect(
  A,
  Effect.succeed({a: 5}).pipe(Effect.tap(() => Effect.log('initialized')))
);
const program3 = Effect.gen(function* () {
  yield* Effect.provide(A2, a2);
  yield* Effect.provide(A2, a2);
});
Effect.runPromise(program3);
/*
Output:
timestamp=... level=INFO fiber=#0 message=initialized
timestamp=... level=INFO fiber=#0 message=initialized
*/

class A3 extends Context.Tag('A')<A, {readonly a: number}>() {}
const a3 = Layer.effect(
  A,
  Effect.succeed({a: 5}).pipe(Effect.tap(() => Effect.log('initialized')))
);
const program4 = Effect.scoped(
  Layer.memoize(a).pipe(
    Effect.andThen(memoized =>
      Effect.gen(function* () {
        yield* Effect.provide(A3, memoized);
        yield* Effect.provide(A3, memoized);
      })
    )
  )
);
Effect.runPromise(program4);
/*
Output:
timestamp=... level=INFO fiber=#0 message=initialized
*/
