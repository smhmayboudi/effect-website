import {
  Cause,
  Config,
  ConfigProvider,
  Effect,
  Either,
  Layer,
  Logger,
  LogLevel,
  Runtime,
} from 'effect';

const program = Effect.log('Application started');
Effect.runSync(program);
/*
Output:
timestamp=... level=INFO fiber=#0 message="Application started"
*/

const program2 = Effect.log('message1', 'message2', 'message3');
Effect.runSync(program2);
/*
Output:
timestamp=... level=INFO fiber=#0 message=message1 message=message2 message=message3
*/

const program3 = Effect.log(
  'message1',
  'message2',
  Cause.die('Oh no!'),
  Cause.die('Oh uh!')
);

Effect.runSync(program3);
/*
Output:
timestamp=... level=INFO fiber=#0 message=message1 message=message2 cause="Error: Oh no!
Error: Oh uh!"
*/

const task1 = Effect.gen(function* () {
  yield* Effect.sleep('2 seconds');
  yield* Effect.logDebug('task1 done');
}).pipe(Logger.withMinimumLogLevel(LogLevel.Debug));
const task2 = Effect.gen(function* () {
  yield* Effect.sleep('1 second');
  yield* Effect.logDebug('task2 done');
});
const program4 = Effect.gen(function* () {
  yield* Effect.log('start');
  yield* task1;
  yield* task2;
  yield* Effect.log('done');
});
Effect.runPromise(program4);
/*
Output:
timestamp=... level=INFO message=start
timestamp=... level=DEBUG message="task1 done" <-- 2 seconds later
timestamp=... level=INFO message=done <-- 1 second later
*/

const task15 = Effect.sleep('2 seconds').pipe(
  Effect.andThen(Effect.logDebug('task1 done')),
  Logger.withMinimumLogLevel(LogLevel.Debug)
);
const task25 = Effect.sleep('1 second').pipe(
  Effect.andThen(Effect.logDebug('task2 done'))
);
const program5 = Effect.log('start').pipe(
  Effect.andThen(task15),
  Effect.andThen(task25),
  Effect.andThen(Effect.log('done'))
);
Effect.runPromise(program5);
/*
Output:
timestamp=... level=INFO message=start
timestamp=... level=DEBUG message="task1 done" <-- 2 seconds later
timestamp=... level=INFO message=done <-- 1 second later
*/

const program6 = Effect.gen(function* () {
  yield* Effect.logInfo('start');
  yield* Effect.sleep('2 seconds');
  yield* Effect.sleep('1 second');
  yield* Effect.logInfo('done');
});
Effect.runPromise(program6);
/*
Output:
timestamp=... level=INFO message=start
timestamp=... level=INFO message=done <-- 3 seconds later
*/

const program7 = Effect.logInfo('start').pipe(
  Effect.andThen(Effect.sleep('2 seconds')),
  Effect.andThen(Effect.sleep('1 second')),
  Effect.andThen(Effect.logInfo('done'))
);
Effect.runPromise(program7);
/*
Output:
timestamp=... level=INFO message=start
timestamp=... level=INFO message=done <-- 3 seconds later
*/

const task = Effect.fail('Oh uh!').pipe(Effect.as(2));
const program8 = Effect.gen(function* () {
  const failureOrSuccess = yield* Effect.either(task);
  if (Either.isLeft(failureOrSuccess)) {
    yield* Effect.logWarning(failureOrSuccess.left);
    return 0;
  } else {
    return failureOrSuccess.right;
  }
});
Effect.runPromise(program8);
/*
Output:
timestamp=... level=WARN fiber=#0 message="Oh uh!"
*/

const task9 = Effect.fail('Oh uh!').pipe(Effect.as(2));
const program9 = task9.pipe(
  Effect.catchAll(error => Effect.logWarning(error).pipe(Effect.as(0)))
);
Effect.runPromise(program9);
/*
Output:
timestamp=... level=WARN fiber=#0 message="Oh uh!"
*/

const task10 = Effect.fail('Oh uh!').pipe(Effect.as(2));
const program10 = Effect.gen(function* () {
  const failureOrSuccess = yield* Effect.either(task10);
  if (Either.isLeft(failureOrSuccess)) {
    yield* Effect.logError(failureOrSuccess.left);
    return 0;
  } else {
    return failureOrSuccess.right;
  }
});
Effect.runPromise(program10);
/*
Output:
timestamp=... level=ERROR fiber=#0 message="Oh uh!"
*/

const task11 = Effect.fail('Oh uh!').pipe(Effect.as(2));
const program11 = task11.pipe(
  Effect.catchAll(error => Effect.logError(error).pipe(Effect.as(0)))
);
Effect.runPromise(program11);
/*
Output:
timestamp=... level=ERROR fiber=#0 message="Oh uh!"
*/

const task12 = Effect.fail('Oh uh!').pipe(Effect.as(2));
const program12 = Effect.gen(function* () {
  const failureOrSuccess = yield* Effect.either(task12);
  if (Either.isLeft(failureOrSuccess)) {
    yield* Effect.logFatal(failureOrSuccess.left);
    return 0;
  } else {
    return failureOrSuccess.right;
  }
});
Effect.runPromise(program12);
/*
Output:
timestamp=... level=FATAL fiber=#0 message="Oh uh!"
*/

const task13 = Effect.fail('Oh uh!').pipe(Effect.as(2));
const program13 = task13.pipe(
  Effect.catchAll(error => Effect.logFatal(error).pipe(Effect.as(0)))
);
Effect.runPromise(program13);
/*
Output:
timestamp=... level=FATAL fiber=#0 message="Oh uh!"
*/

const program14 = Effect.gen(function* () {
  yield* Effect.log('message1');
  yield* Effect.log('message2');
}).pipe(Effect.annotateLogs('key', 'value')); // Annotation as key/value pair
Effect.runSync(program14);
/*
Output:
timestamp=... level=INFO fiber=#0 message=message1 key=value
timestamp=... level=INFO fiber=#0 message=message2 key=value
*/

const program15 = Effect.gen(function* () {
  yield* Effect.log('message1');
  yield* Effect.log('message2');
}).pipe(Effect.annotateLogs({key1: 'value1', key2: 'value2'}));
Effect.runSync(program15);
/*
Output:
timestamp=... level=INFO fiber=#0 message=message1 key2=value2 key1=value1
timestamp=... level=INFO fiber=#0 message=message2 key2=value2 key1=value1
*/

const program16 = Effect.gen(function* () {
  yield* Effect.log('no annotations');
  yield* Effect.annotateLogsScoped({key: 'value'});
  yield* Effect.log('message1'); // Annotation is applied to this log
  yield* Effect.log('message2'); // Annotation is applied to this log
}).pipe(Effect.scoped, Effect.andThen(Effect.log('no annotations again')));
Effect.runSync(program16);
/*
Output:
timestamp=... level=INFO fiber=#0 message="no annotations"
timestamp=... level=INFO fiber=#0 message=message1 key=value
timestamp=... level=INFO fiber=#0 message=message2 key=value
timestamp=... level=INFO fiber=#0 message="no annotations again"
*/

const program17 = Effect.gen(function* () {
  yield* Effect.sleep('1 second');
  yield* Effect.log('The job is finished!');
}).pipe(Effect.withLogSpan('myspan'));
Effect.runPromise(program17);
/*
Output:
timestamp=... level=INFO fiber=#0 message="The job is finished!" myspan=1011ms
*/

const program18 = Effect.gen(function* () {
  yield* Effect.log('Executing task...');
  yield* Effect.sleep('100 millis');
  console.log('task done');
});
// Logging enabled (default)
Effect.runPromise(program18);
/*
Output:
timestamp=... level=INFO fiber=#0 message="Executing task..."
task done
*/
// Logging disabled using withMinimumLogLevel
Effect.runPromise(program18.pipe(Logger.withMinimumLogLevel(LogLevel.None)));
/*
Output:
task done
*/

const program19 = Effect.gen(function* () {
  yield* Effect.log('Executing task...');
  yield* Effect.sleep('100 millis');
  console.log('task done');
});
const layer = Logger.minimumLogLevel(LogLevel.None);
// Logging disabled using a layer
Effect.runPromise(program19.pipe(Effect.provide(layer)));
/*
Output:
task done
*/

const program20 = Effect.gen(function* () {
  yield* Effect.log('Executing task...');
  yield* Effect.sleep('100 millis');
  console.log('task done');
});
const customRuntime = Effect.runSync(
  Effect.scoped(Layer.toRuntime(Logger.minimumLogLevel(LogLevel.None)))
);
// Logging disabled using a custom runtime
const customRunPromise = Runtime.runPromise(customRuntime);
customRunPromise(program20);
/*
Output:
task done
*/

// Simulate a program with logs
const program21 = Effect.gen(function* () {
  yield* Effect.logError('ERROR!');
  yield* Effect.logWarning('WARNING!');
  yield* Effect.logInfo('INFO!');
  yield* Effect.logDebug('DEBUG!');
});
// Load the log level from the configuration as a layer
const LogLevelLive = Config.logLevel('LOG_LEVEL').pipe(
  Effect.andThen(level => Logger.minimumLogLevel(level)),
  Layer.unwrapEffect
);
// Configure the program with the loaded log level
const configured = Effect.provide(program21, LogLevelLive);
// Test the configured program using ConfigProvider.fromMap
const test = Effect.provide(
  configured,
  Layer.setConfigProvider(
    ConfigProvider.fromMap(new Map([['LOG_LEVEL', LogLevel.Warning.label]]))
  )
);
Effect.runPromise(test);
/*
Output:
... level=ERROR fiber=#0 message=ERROR!
... level=WARN fiber=#0 message=WARNING!
*/

export const logger = Logger.make(({logLevel, message}) => {
  // this line need an extra property in package.json file.
  globalThis.console.log(`[${logLevel.label}] ${message}`);
});

const task221 = Effect.gen(function* () {
  yield* Effect.sleep('2 seconds');
  yield* Effect.logDebug('task221 done');
});
const task222 = Effect.gen(function* () {
  yield* Effect.sleep('1 second');
  yield* Effect.logDebug('task222 done');
});
export const program22 = Effect.gen(function* () {
  yield* Effect.log('start');
  yield* task221;
  yield* task222;
  yield* Effect.log('done');
});

const task231 = Effect.sleep('2 seconds').pipe(
  Effect.andThen(Effect.logDebug('task231 done'))
);
const task232 = Effect.sleep('1 second').pipe(
  Effect.andThen(Effect.logDebug('task232 done'))
);
export const program23 = Effect.log('start').pipe(
  Effect.andThen(task231),
  Effect.andThen(task232),
  Effect.andThen(Effect.log('done'))
);

const layer23 = Logger.replace(Logger.defaultLogger, logger);
Effect.runPromise(
  Effect.provide(Logger.withMinimumLogLevel(program23, LogLevel.Debug), layer23)
);
