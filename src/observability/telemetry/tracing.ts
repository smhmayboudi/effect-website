import {Effect} from 'effect';
import {NodeSdk} from '@effect/opentelemetry';
import {
  ConsoleSpanExporter,
  BatchSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-grpc';

const program = Effect.void.pipe(Effect.delay('100 millis'));
const instrumented = program.pipe(Effect.withSpan('myspan'));

const program2 = Effect.void.pipe(Effect.delay('100 millis'));
const instrumented2 = program2.pipe(Effect.withSpan('myspan'));
const NodeSdkLive = NodeSdk.layer(() => ({
  resource: {serviceName: 'example'},
  spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
}));
Effect.runPromise(instrumented2.pipe(Effect.provide(NodeSdkLive)));
/*
Example Output:
{
  traceId: 'd0f730abfc366205806469596092b239',
  parentId: undefined,
  traceState: undefined,
  name: 'myspan',
  id: 'ab4e42592e7f1f7c',
  kind: 0,
  timestamp: 1697040012664380.5,
  duration: 2895.769,
  attributes: {},
  status: { code: 1 },
  events: [],
  links: []
}
*/

const program3 = Effect.fail('Oh no!').pipe(
  Effect.delay('100 millis'),
  Effect.withSpan('myspan')
);
const NodeSdkLive3 = NodeSdk.layer(() => ({
  resource: {serviceName: 'example'},
  spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
}));
Effect.runPromiseExit(program3.pipe(Effect.provide(NodeSdkLive3))).then(
  console.log
);
/*
Example Output:
{
  traceId: '760510a3f9a0881a09de990c87ec1cef',
  parentId: undefined,
  traceState: undefined,
  name: 'myspan',
  id: 'a528e38e82e848a5',
  kind: 0,
  timestamp: 1697091363002970.5,
  duration: 110371.664,
  attributes: {},
  status: { code: 2, message: 'Error: Oh no!' },
  events: [],
  links: []
}
{
  _id: 'Exit',
  _tag: 'Failure',
  cause: { _id: 'Cause', _tag: 'Fail', failure: 'Oh no!' }
}
*/

const program4 = Effect.void.pipe(
  Effect.delay('100 millis'),
  Effect.tap(() => Effect.annotateCurrentSpan('key', 'value')),
  Effect.withSpan('myspan')
);

const NodeSdkLive4 = NodeSdk.layer(() => ({
  resource: {serviceName: 'example'},
  spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
}));

Effect.runPromise(program4.pipe(Effect.provide(NodeSdkLive4)));
/*
Example Output:
{
  traceId: '869c9d74d9db14a4ba4393ca8e0f61db',
  parentId: undefined,
  traceState: undefined,
  name: 'myspan',
  id: '31eb49570d197f8d',
  kind: 0,
  timestamp: 1697045981663321.5,
  duration: 109563.353,
  attributes: { key: 'value' },
  status: { code: 1 },
  events: [],
  links: []
}
*/

const program5 = Effect.log('Hello').pipe(
  Effect.delay('100 millis'),
  Effect.withSpan('myspan')
);

const NodeSdkLive5 = NodeSdk.layer(() => ({
  resource: {serviceName: 'example'},
  spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
}));

Effect.runPromise(program5.pipe(Effect.provide(NodeSdkLive5)));
/*
Example Output:
{
  traceId: 'ad708d58c15f9e5c7b5cca2eeb6838a2',
  parentId: undefined,
  traceState: undefined,
  name: 'myspan',
  id: '4353fd47423e786a',
  kind: 0,
  timestamp: 1697043230170724.2,
  duration: 112052.514,
  attributes: {},
  status: { code: 1 },
  events: [
    {
      name: 'Hello',
      attributes: { 'effect.fiberId': '#0', 'effect.logLevel': 'INFO' },
      time: [ 1697043230, 280923805 ],
      droppedAttributesCount: 0
    }
  ],
  links: []
}
*/

const child = Effect.void.pipe(
  Effect.delay('100 millis'),
  Effect.withSpan('child')
);

const parent = Effect.gen(function* () {
  yield* Effect.sleep('20 millis');
  yield* child;
  yield* Effect.sleep('10 millis');
}).pipe(Effect.withSpan('parent'));

const NodeSdkLive6 = NodeSdk.layer(() => ({
  resource: {serviceName: 'example'},
  spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
}));

Effect.runPromise(parent.pipe(Effect.provide(NodeSdkLive6)));
/*
Example Output:
{
  traceId: '92fe81f1454d9c099198568cf867dc59',
  parentId: 'b953d6c7d37ad93d',
  traceState: undefined,
  name: 'child',
  id: '2fd19c8c23ebc7e8',
  kind: 0,
  timestamp: 1697043815321888.2,
  duration: 106536.264,
  attributes: {},
  status: { code: 1 },
  events: [],
  links: []
}
{
  traceId: '92fe81f1454d9c099198568cf867dc59',
  parentId: undefined,
  traceState: undefined,
  name: 'parent',
  id: 'b953d6c7d37ad93d',
  kind: 0,
  timestamp: 1697043815292133.2,
  duration: 149724.295,
  attributes: {},
  status: { code: 1 },
  events: [],
  links: []
}
*/

// Function to simulate a task with possible subtasks
const task = (
  name: string,
  delay: number,
  children: ReadonlyArray<Effect.Effect<void>> = []
) =>
  Effect.gen(function* () {
    yield* Effect.log(name);
    yield* Effect.sleep(`${delay} millis`);
    for (const child of children) {
      yield* child;
    }
    yield* Effect.sleep(`${delay} millis`);
  }).pipe(Effect.withSpan(name));

const poll = task('/poll', 1);

// Create a program with tasks and subtasks
const program7 = task('client', 2, [
  task('/api', 3, [
    task('/authN', 4, [task('/authZ', 5)]),
    task('/payment Gateway', 6, [task('DB', 7), task('Ext. Merchant', 8)]),
    task('/dispatch', 9, [
      task('/dispatch/search', 10),
      Effect.all([poll, poll, poll], {concurrency: 'inherit'}),
      task('/pollDriver/{id}', 11),
    ]),
  ]),
]);

const NodeSdkLive7 = NodeSdk.layer(() => ({
  resource: {serviceName: 'example'},
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

Effect.runPromise(
  program7.pipe(
    Effect.provide(NodeSdkLive7),
    Effect.catchAllCause(Effect.logError)
  )
);
/*
Output:
timestamp=... level=INFO fiber=#0 message=client
timestamp=... level=INFO fiber=#0 message=/api
timestamp=... level=INFO fiber=#0 message=/authN
timestamp=... level=INFO fiber=#0 message=/authZ
timestamp=... level=INFO fiber=#0 message="/payment Gateway"
timestamp=... level=INFO fiber=#0 message=DB
timestamp=... level=INFO fiber=#0 message="Ext. Merchant"
timestamp=... level=INFO fiber=#0 message=/dispatch
timestamp=... level=INFO fiber=#0 message=/dispatch/search
timestamp=... level=INFO fiber=#3 message=/poll
timestamp=... level=INFO fiber=#4 message=/poll
timestamp=... level=INFO fiber=#5 message=/poll
timestamp=... level=INFO fiber=#0 message=/pollDriver/{id}
*/
