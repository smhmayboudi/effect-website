import {Effect} from 'effect';
const success = Effect.succeed('success');
const failure = Effect.fail('failure');
const fallback = Effect.succeed('fallback');
const program1 = Effect.orElse(success, () => fallback);
console.log(Effect.runSync(program1)); // Output: "success"
const program2 = Effect.orElse(failure, () => fallback);
console.log(Effect.runSync(program2)); // Output: "fallback"

class NegativeAgeError {
  readonly _tag = 'NegativeAgeError';
  constructor(readonly age: number) {}
}

class IllegalAgeError {
  readonly _tag = 'IllegalAgeError';
  constructor(readonly age: number) {}
}

const validate = (
  age: number
): Effect.Effect<number, NegativeAgeError | IllegalAgeError> => {
  if (age < 0) {
    return Effect.fail(new NegativeAgeError(age));
  } else if (age < 18) {
    return Effect.fail(new IllegalAgeError(age));
  } else {
    return Effect.succeed(age);
  }
};

const program3 = Effect.orElseFail(validate(3), () => 'invalid age');

const program4 = Effect.orElseSucceed(validate(3), () => 0);

interface Config2 {
  // ...
}

const makeConfig = (/* ... */): Config2 => ({});

const remoteConfig = (name: string): Effect.Effect<Config2, Error> =>
  Effect.gen(function* () {
    if (name === 'node3') {
      yield* Console.log(`Config for ${name} found`);
      return makeConfig();
    } else {
      yield* Console.log(`Unavailable config for ${name}`);
      return yield* Effect.fail(new Error());
    }
  });

const masterConfig = remoteConfig('master');

const nodeConfigs = ['node1', 'node2', 'node3', 'node4'].map(remoteConfig);

const config = Effect.firstSuccessOf([masterConfig, ...nodeConfigs]);

console.log(Effect.runSync(config));
/*
Output:
Unavailable config for master
Unavailable config for node1
Unavailable config for node2
Config for node3 found
{}
*/
