import {Array, Effect, Either, Option, pipe} from 'effect';

// Define simple arithmetic operations
const increment = (x: number) => x + 1;
const double = (x: number) => x * 2;
const subtractTen = (x: number) => x - 10;
// Sequentially apply these operations using `pipe`
const result = pipe(5, increment, double, subtractTen);
console.log(result); // Output: 2

const mappedEffect = pipe(myEffect, Effect.map(transformation));
// or
const mappedEffect2 = Effect.map(myEffect, transformation);
// or
const mappedEffect3 = myEffect.pipe(Effect.map(transformation));

// Function to add a small service charge to a transaction amount
const addServiceCharge = (amount: number) => amount + 1;

// Simulated asynchronous task to fetch a transaction amount from a database
const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100));

// Apply service charge to the transaction amount
const finalAmount = pipe(fetchTransactionAmount, Effect.map(addServiceCharge));

Effect.runPromise(finalAmount).then(console.log); // Output: 101

const program = pipe(Effect.succeed(5), Effect.as('new value'));

Effect.runPromise(program).then(console.log); // Output: "new value"

const flatMappedEffect = pipe(myEffect, Effect.flatMap(transformation));
// or
const flatMappedEffect2 = Effect.flatMap(myEffect, transformation);
// or
const flatMappedEffect3 = myEffect.pipe(Effect.flatMap(transformation));

// Function to apply a discount safely to a transaction amount
const applyDiscount = (
  total: number,
  discountRate: number
): Effect.Effect<number, Error> =>
  discountRate === 0
    ? Effect.fail(new Error('Discount rate cannot be zero'))
    : Effect.succeed(total - (total * discountRate) / 100);

// Simulated asynchronous task to fetch a transaction amount from a database
const fetchTransactionAmount2 = Effect.promise(() => Promise.resolve(100));

const finalAmount2 = pipe(
  fetchTransactionAmount2,
  Effect.flatMap(amount => applyDiscount(amount, 5))
);

Effect.runPromise(finalAmount2).then(console.log); // Output: 95

Effect.flatMap(amount => {
  Effect.sync(() => console.log(`Apply a discount to: ${amount}`)); // This effect is ignored
  return applyDiscount(amount, 5);
});

const flattened = pipe(
  Effect.succeed([
    [1, 2],
    [3, 4],
  ]),
  Effect.map(nested => Array.flatten(nested))
);

const transformedEffect = pipe(myEffect, Effect.andThen(anotherEffect));
// or
const transformedEffect2 = Effect.andThen(myEffect, anotherEffect);
// or
const transformedEffect3 = myEffect.pipe(Effect.andThen(anotherEffect));

// Function to apply a discount safely to a transaction amount
const applyDiscount2 = (
  total: number,
  discountRate: number
): Effect.Effect<number, Error> =>
  discountRate === 0
    ? Effect.fail(new Error('Discount rate cannot be zero'))
    : Effect.succeed(total - (total * discountRate) / 100);
// Simulated asynchronous task to fetch a transaction amount from a database
const fetchTransactionAmount3 = Effect.promise(() => Promise.resolve(100));
// Using Effect.map, Effect.flatMap
const result1 = pipe(
  fetchTransactionAmount3,
  Effect.map(amount => amount * 2),
  Effect.flatMap(amount => applyDiscount2(amount, 5))
);
Effect.runPromise(result1).then(console.log); // Output: 190
// Using Effect.andThen
const result2 = pipe(
  fetchTransactionAmount3,
  Effect.andThen(amount => amount * 2),
  Effect.andThen(amount => applyDiscount(amount, 5))
);
Effect.runPromise(result2).then(console.log); // Output: 190

// Simulated asynchronous task fetching a number from a database
const fetchStringValue = Effect.promise(() => Promise.resolve(42));

// Although one might expect the type to be Effect<Option<number>, never, never>,
// it is actually Effect<number, NoSuchElementException, never>
const program2 = pipe(
  fetchStringValue,
  Effect.andThen(x => (x > 0 ? Option.some(x) : Option.none()))
);

// Function to parse an integer from a string that can fail
const parseInteger = (input: string): Either.Either<number, string> =>
  isNaN(parseInt(input))
    ? Either.left('Invalid integer')
    : Either.right(parseInt(input));

// Simulated asynchronous task fetching a string from a database
const fetchStringValue2 = Effect.promise(() => Promise.resolve('42'));

// Although one might expect the type to be Effect<Either<number, string>, never, never>,
// it is actually Effect<number, string, never>
const program3 = pipe(
  fetchStringValue2,
  Effect.andThen(str => parseInteger(str))
);

// Function to apply a discount safely to a transaction amount
const applyDiscount = (
  total: number,
  discountRate: number
): Effect.Effect<number, Error> =>
  discountRate === 0
    ? Effect.fail(new Error('Discount rate cannot be zero'))
    : Effect.succeed(total - (total * discountRate) / 100);

// Simulated asynchronous task to fetch a transaction amount from a database
const fetchTransactionAmount4 = Effect.promise(() => Promise.resolve(100));

const finalAmount4 = pipe(
  fetchTransactionAmount4,
  Effect.tap(amount =>
    Effect.sync(() => console.log(`Apply a discount to: ${amount}`))
  ),
  // `amount` is still available!
  Effect.flatMap(amount => applyDiscount(amount, 5))
);

Effect.runPromise(finalAmount4).then(console.log);
/*
Output:
Apply a discount to: 100
95
*/

// Simulated function to read configuration from a file
const webConfig = Effect.promise(() =>
  Promise.resolve({dbConnection: 'localhost', port: 8080})
);

// Simulated function to test database connectivity
const checkDatabaseConnectivity = Effect.promise(() =>
  Promise.resolve('Connected to Database')
);

// Combine both effects to perform startup checks
const startupChecks = Effect.all([webConfig, checkDatabaseConnectivity]);

Effect.runPromise(startupChecks).then(([config, dbStatus]) => {
  console.log(
    `Configuration: ${JSON.stringify(config)}, DB Status: ${dbStatus}`
  );
});
/*
Output:
Configuration: {"dbConnection":"localhost","port":8080}, DB Status: Connected to Database
*/

// Function to add a small service charge to a transaction amount
const addServiceCharge5 = (amount: number) => amount + 1;

// Function to apply a discount safely to a transaction amount
const applyDiscount5 = (
  total: number,
  discountRate: number
): Effect.Effect<number, Error> =>
  discountRate === 0
    ? Effect.fail(new Error('Discount rate cannot be zero'))
    : Effect.succeed(total - (total * discountRate) / 100);

// Simulated asynchronous task to fetch a transaction amount from a database
const fetchTransactionAmount5 = Effect.promise(() => Promise.resolve(100));

// Simulated asynchronous task to fetch a discount rate from a configuration file
const fetchDiscountRate = Effect.promise(() => Promise.resolve(5));

// Assembling the program using a pipeline of effects
const program5 = pipe(
  Effect.all([fetchTransactionAmount5, fetchDiscountRate]),
  Effect.flatMap(([transactionAmount, discountRate]) =>
    applyDiscount5(transactionAmount, discountRate)
  ),
  Effect.map(addServiceCharge5),
  Effect.map(finalAmount => `Final amount to charge: ${finalAmount}`)
);

// Execute the program and log the result
Effect.runPromise(program).then(console.log); // Output: "Final amount to charge: 96"

const program6 = Effect.all([fetchTransactionAmount, fetchDiscountRate]).pipe(
  Effect.flatMap(([transactionAmount, discountRate]) =>
    applyDiscount(transactionAmount, discountRate)
  ),
  Effect.map(addServiceCharge),
  Effect.map(finalAmount => `Final amount to charge: ${finalAmount}`)
);
