import {Array, Console, Effect, Metric, MetricBoundaries, Random} from 'effect';

const numberCounter = Metric.counter('request_count', {
  description: 'A counter for tracking requests',
});

const bigintCounter = Metric.counter('error_count', {
  description: 'A counter for tracking errors',
  bigint: true,
});

const incrementalCounter = Metric.counter('count', {
  description: 'a counter that only increases its value',
  incremental: true,
});

// Create a counter named 'task_count' and increment it by 1 every time it's invoked
const taskCount = Metric.counter('task_count').pipe(
  Metric.withConstantInput(1)
);

const task1 = Effect.succeed(1).pipe(Effect.delay('100 millis'));
const task2 = Effect.succeed(2).pipe(Effect.delay('200 millis'));

const program = Effect.gen(function* () {
  const a = yield* taskCount(task1);
  const b = yield* taskCount(task2);
  return a + b;
});

const showMetric = Metric.value(taskCount).pipe(Effect.andThen(Console.log));

Effect.runPromise(program.pipe(Effect.tap(() => showMetric))).then(console.log);
/*
Output:
CounterState {
  count: 2,
  ...
}
3
*/

const numberGauge = Metric.gauge('memory_usage', {
  description: 'A gauge for memory usage',
});

const bigintGauge = Metric.gauge('cpu_load', {
  description: 'A gauge for CPU load',
  bigint: true,
});

const temperature = Metric.gauge('temperature');

const getTemperature = Effect.gen(function* () {
  const n = yield* Random.nextIntBetween(-10, 10);
  console.log(`variation: ${n}`);
  return n;
});

const program2 = Effect.gen(function* () {
  const series: Array<number> = [];
  series.push(yield* temperature(getTemperature));
  series.push(yield* temperature(getTemperature));
  series.push(yield* temperature(getTemperature));
  return series;
});

const showMetric2 = Metric.value(temperature).pipe(Effect.andThen(Console.log));

Effect.runPromise(program2.pipe(Effect.tap(() => showMetric2))).then(
  Console.log
);
/*
Output:
variation: 6
variation: -4
variation: -9
GaugeState {
  value: -9,
  ...
}
[ 6, -4, -9 ]
*/

const latencyHistogram = Metric.histogram(
  'request_latency',
  MetricBoundaries.linear({start: 0, width: 10, count: 11})
);
const program3 = latencyHistogram(Random.nextIntBetween(1, 120)).pipe(
  Effect.repeatN(99)
);
Effect.runPromise(
  program3.pipe(Effect.andThen(Metric.value(latencyHistogram)))
).then(histogramState => console.log('%o', histogramState));
/*
Output:
HistogramState {
  buckets: [
    [ 0, 0 ],
    [ 10, 7 ],
    [ 20, 11 ],
    [ 30, 20 ],
    [ 40, 27 ],
    [ 50, 38 ],
    [ 60, 53 ],
    [ 70, 64 ],
    [ 80, 73 ],
    [ 90, 84 ],
    [ Infinity, 100 ],
    [length]: 11
  ],
  count: 100,
  min: 1,
  max: 119,
  sum: 5980,
  ...
}
*/

// Metric<Histogram, Duration, Histogram>
const timer = Metric.timerWithBoundaries('timer', Array.range(1, 10));

const program4 = Random.nextIntBetween(1, 10).pipe(
  Effect.andThen(n => Effect.sleep(`${n} millis`)),
  Metric.trackDuration(timer),
  Effect.repeatN(99)
);

Effect.runPromise(program4.pipe(Effect.andThen(Metric.value(timer)))).then(
  histogramState => console.log('%o', histogramState)
);
/*
Output:
HistogramState {
  buckets: [
    [ 1, 3 ],
    [ 2, 13 ],
    [ 3, 17 ],
    [ 4, 26 ],
    [ 5, 35 ],
    [ 6, 43 ],
    [ 7, 53 ],
    [ 8, 56 ],
    [ 9, 65 ],
    [ 10, 72 ],
    [ Infinity, 100 ],
    [length]: 11
  ],
  count: 100,
  min: 0.25797,
  max: 12.25421,
  sum: 683.0266810000002,
  ...
}
*/

const responseTimeSummary = Metric.summary({
  name: 'response_time_summary',
  maxAge: '1 day',
  maxSize: 100,
  error: 0.03,
  quantiles: [0.1, 0.5, 0.9],
});

const program5 = responseTimeSummary(Random.nextIntBetween(1, 120)).pipe(
  Effect.repeatN(99)
);

Effect.runPromise(
  program5.pipe(Effect.andThen(Metric.value(responseTimeSummary)))
).then(summaryState => console.log('%o', summaryState));
/*
Output:
SummaryState {
  error: 0.03,
  quantiles: [
    [ 0.1, { _id: 'Option', _tag: 'Some', value: 17 } ],
    [ 0.5, { _id: 'Option', _tag: 'Some', value: 62 } ],
    [ 0.9, { _id: 'Option', _tag: 'Some', value: 109 } ]
  ],
  count: 100,
  min: 4,
  max: 119,
  sum: 6058,
  ...
}
*/

const errorFrequency = Metric.frequency('error_frequency');
const program6 = errorFrequency(
  Random.nextIntBetween(1, 10).pipe(Effect.andThen(n => `Error-${n}`))
).pipe(Effect.repeatN(99));
Effect.runPromise(
  program6.pipe(Effect.andThen(Metric.value(errorFrequency)))
).then(frequencyState => console.log('%o', frequencyState));
/*
Output:
FrequencyState {
  occurrences: Map(9) {
    'Error-7' => 12,
    'Error-2' => 12,
    'Error-4' => 14,
    'Error-1' => 14,
    'Error-9' => 8,
    'Error-6' => 11,
    'Error-5' => 9,
    'Error-3' => 14,
    'Error-8' => 6
  },
  ...
}
*/

const taskCount7 = Metric.counter('task_count');
const task7 = Effect.succeed(1).pipe(Effect.delay('100 millis'));

Effect.gen(function* () {
  yield* taskCount7(task7);
}).pipe(Effect.tagMetrics('environment', 'production'));

const counter = Metric.counter('request_count').pipe(
  Metric.tagged('environment', 'production')
);
