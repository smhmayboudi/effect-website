import {Effect} from 'effect';
import * as NodeFS from 'node:fs';

const success = Effect.succeed(42);

// Creating an effect that represents a failure scenario
const failure = Effect.fail(new Error('Operation failed due to network error'));

const failure2 = Effect.fail('Something went wrong');

const divide = (a: number, b: number): Effect.Effect<number, Error> =>
  b === 0
    ? Effect.fail(new Error('Cannot divide by zero'))
    : Effect.succeed(a / b);

// Define a User type
interface User {
  readonly id: number;
  readonly name: string;
}

// A mocked function to simulate fetching a user from a database
const getUser = (userId: number): Effect.Effect<User, Error> => {
  // Normally, you would access a database or an API here, but we'll mock it
  const userDatabase: Record<number, User> = {
    1: {id: 1, name: 'John Doe'},
    2: {id: 2, name: 'Jane Smith'},
  };

  // Check if the user exists in our "database" and return appropriately
  const user = userDatabase[userId];
  if (user) {
    return Effect.succeed(user);
  } else {
    return Effect.fail(new Error('User not found'));
  }
};

// When executed, this will successfully return the user with id 1
const exampleUserEffect = getUser(1);

const log = (message: string) =>
  Effect.sync(() => {
    console.log(message); // side effect
  });

const program = log('Hello, World!');

const parse = (input: string) =>
  Effect.try(
    () => JSON.parse(input) // This might throw an error if input is not valid JSON
  );

const program2 = parse('');

const parse2 = (input: string) =>
  Effect.try({
    try: () => JSON.parse(input), // JSON.parse may throw for bad input
    catch: unknown => new Error(`something went wrong ${unknown}`), // remap the error
  });

const program3 = parse2('');

const delay = (message: string) =>
  Effect.promise<string>(
    () =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve(message);
        }, 2000);
      })
  );

const program4 = delay('Async operation completed successfully!');

const getTodo = (id: number) =>
  Effect.tryPromise(() =>
    fetch(`https://jsonplaceholder.typicode.com/todos/${id}`)
  );

const program5 = getTodo(1);

const getTodo2 = (id: number) =>
  Effect.tryPromise({
    try: () => fetch(`https://jsonplaceholder.typicode.com/todos/${id}`),
    // remap the error
    catch: unknown => new Error(`something went wrong ${unknown}`),
  });

const program6 = getTodo2(1);

const readFile = (filename: string) =>
  Effect.async<Buffer, Error>(resume => {
    NodeFS.readFile(filename, (error, data) => {
      if (error) {
        resume(Effect.fail(error));
      } else {
        resume(Effect.succeed(data));
      }
    });
  });

const program7 = readFile('todos.txt');

let i = 0;

const bad = Effect.succeed(i++);

const good = Effect.suspend(() => Effect.succeed(i++));

console.log(Effect.runSync(bad)); // Output: 0
console.log(Effect.runSync(bad)); // Output: 0

console.log(Effect.runSync(good)); // Output: 1
console.log(Effect.runSync(good)); // Output: 2

const blowsUp = (n: number): Effect.Effect<number> =>
  n < 2
    ? Effect.succeed(1)
    : Effect.zipWith(blowsUp(n - 1), blowsUp(n - 2), (a, b) => a + b);

// console.log(Effect.runSync(blowsUp(32))) // crash: JavaScript heap out of memory

const allGood = (n: number): Effect.Effect<number> =>
  n < 2
    ? Effect.succeed(1)
    : Effect.zipWith(
        Effect.suspend(() => allGood(n - 1)),
        Effect.suspend(() => allGood(n - 2)),
        (a, b) => a + b
      );

console.log(Effect.runSync(allGood(32))); // Output: 3524578

const ugly = (a: number, b: number) =>
  b === 0
    ? Effect.fail(new Error('Cannot divide by zero'))
    : Effect.succeed(a / b);

const nice = (a: number, b: number) =>
  Effect.suspend(() =>
    b === 0
      ? Effect.fail(new Error('Cannot divide by zero'))
      : Effect.succeed(a / b)
  );
