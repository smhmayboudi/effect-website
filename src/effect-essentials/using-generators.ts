import {Effect} from 'effect';
// Function to add a small service charge to a transaction amount
const addServiceCharge = (amount: number) => amount + 1;
// Function to apply a discount safely to a transaction amount
const applyDiscount = (
  total: number,
  discountRate: number
): Effect.Effect<number, Error> =>
  discountRate === 0
    ? Effect.fail(new Error('Discount rate cannot be zero'))
    : Effect.succeed(total - (total * discountRate) / 100);
// Simulated asynchronous task to fetch a transaction amount from a database
const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100));
// Simulated asynchronous task to fetch a discount rate from a configuration file
const fetchDiscountRate = Effect.promise(() => Promise.resolve(5));
// Assembling the program using a generator function
const program = Effect.gen(function* () {
  // Retrieve the transaction amount
  const transactionAmount = yield* fetchTransactionAmount;
  // Retrieve the discount rate
  const discountRate = yield* fetchDiscountRate;
  // Calculate discounted amount
  const discountedAmount = yield* applyDiscount(
    transactionAmount,
    discountRate
  );
  // Apply service charge
  const finalAmount = addServiceCharge(discountedAmount);
  // Return the total amount after applying the charge
  return `Final amount to charge: ${finalAmount}`;
});
// Execute the program and log the result
Effect.runPromise(program).then(console.log); // Output: "Final amount to charge: 96"

const addServiceCharge2 = (amount: number) => amount + 1;
const applyDiscount2 = (
  total: number,
  discountRate: number
): Effect.Effect<number, Error> =>
  discountRate === 0
    ? Effect.fail(new Error('Discount rate cannot be zero'))
    : Effect.succeed(total - (total * discountRate) / 100);
const fetchTransactionAmount2 = Effect.promise(() => Promise.resolve(100));
const fetchDiscountRate2 = Effect.promise(() => Promise.resolve(5));
export const program2 = Effect.gen(function* () {
  const transactionAmount = yield* fetchTransactionAmount2;
  const discountRate = yield* fetchDiscountRate2;
  const discountedAmount = yield* applyDiscount2(
    transactionAmount,
    discountRate
  );
  const finalAmount = addServiceCharge2(discountedAmount);
  return `Final amount to charge: ${finalAmount}`;
});

const addServiceCharge3 = (amount: number) => amount + 1;
const applyDiscount3 = (
  total: number,
  discountRate: number
): Promise<number> =>
  discountRate === 0
    ? Promise.reject(new Error('Discount rate cannot be zero'))
    : Promise.resolve(total - (total * discountRate) / 100);
const fetchTransactionAmount3 = Promise.resolve(100);
const fetchDiscountRate3 = Promise.resolve(5);
export const program3 = async function () {
  const transactionAmount = await fetchTransactionAmount3;
  const discountRate = await fetchDiscountRate3;
  const discountedAmount = await applyDiscount3(
    transactionAmount,
    discountRate
  );
  const finalAmount = addServiceCharge3(discountedAmount);
  return `Final amount to charge: ${finalAmount}`;
};

const calculateTax = (
  amount: number,
  taxRate: number
): Effect.Effect<number, Error> =>
  taxRate > 0
    ? Effect.succeed((amount * taxRate) / 100)
    : Effect.fail(new Error('Invalid tax rate'));
const program4 = Effect.gen(function* () {
  let i = 1;
  while (true) {
    if (i === 10) {
      break; // Break the loop when counter reaches 10
    } else {
      if (i % 2 === 0) {
        // Calculate tax for even numbers
        console.log(yield* calculateTax(100, i));
      }
      i++;
      continue;
    }
  }
});
Effect.runPromise(program4);
/*
Output:
2
4
6
8
*/

const program5 = Effect.gen(function* () {
  console.log('Task1...');
  console.log('Task2...');
  // Introduce an error into the flow
  yield* Effect.fail('Something went wrong!');
});

Effect.runPromiseExit(program5).then(console.log);
/*
Output:
Task1...
Task2...
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Fail', failure: 'Something went wrong!' }
}
*/

const program6 = Effect.gen(function* () {
  console.log('Task1...');
  console.log('Task2...');
  yield* Effect.fail('Something went wrong!');
  console.log("This won't be executed");
});
Effect.runPromise(program6).then(console.log, console.error);
/*
Output:
Task1...
Task2...
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Fail', failure: 'Something went wrong!' }
}
*/

class MyService {
  readonly local = 1;
  compute = Effect.gen(this, function* () {
    return yield* Effect.succeed(this.local + 1);
  });
}
console.log(Effect.runSync(new MyService().compute)); // Output: 2
