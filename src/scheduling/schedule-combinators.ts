import {Console, Effect, Schedule} from 'effect';

declare const log: <A, Out>(
  action: Effect.Effect<A>,
  schedule: Schedule.Schedule<Out, void>
) => void;

const schedule = Schedule.union(
  Schedule.exponential('100 millis'),
  Schedule.spaced('1 second')
);
const action = Effect.void;
log(action, schedule);
/*
Output:
delay: 0
#1 delay: 100  < exponential
#2 delay: 200
#3 delay: 400
#4 delay: 800
#5 delay: 1000 < spaced
#6 delay: 1000
#7 delay: 1000
#8 delay: 1000
#9 delay: 1000
...
*/

const schedule2 = Schedule.intersect(
  Schedule.exponential('10 millis'),
  Schedule.recurs(5)
);
const action2 = Effect.void;
log(action2, schedule2);
/*
Output:
delay: 0
#1 delay: 10  < exponential
#2 delay: 20
#3 delay: 40
#4 delay: 80
#5 delay: 160
(end)         < recurs
*/

const schedule3 = Schedule.jittered(Schedule.exponential('10 millis'));
const action3 = Effect.void;
log(action3, schedule3);
/*
Output:
delay: 0
#1 delay: 9.006765
#2 delay: 20.549507999999996
#3 delay: 45.86659000000001
#4 delay: 77.055037
#5 delay: 178.06722299999998
#6 delay: 376.056965
#7 delay: 728.732785
#8 delay: 1178.174953
#9 delay: 2331.4659370000004
...
*/

const schedule4 = Schedule.whileOutput(Schedule.recurs(5), n => n <= 2);
const action4 = Effect.void;
log(action4, schedule4);
/*
Output:
delay: 0
#1 delay: 0 < recurs
#2 delay: 0
#3 delay: 0
(end)       < whileOutput
*/

const schedule5 = Schedule.modifyDelay(
  Schedule.spaced('1 second'),
  _ => '100 millis'
);
const action5 = Effect.void;
log(action5, schedule5);
/*
Output:
delay: 0
#1 delay: 100 < modifyDelay
#2 delay: 100
#3 delay: 100
#4 delay: 100
#5 delay: 100
#6 delay: 100
#7 delay: 100
#8 delay: 100
#9 delay: 100
...
*/

const schedule6 = Schedule.tapOutput(Schedule.recurs(2), n =>
  Console.log(`repeating ${n}`)
);
const action6 = Effect.void;
log(action6, schedule6);
/*
Output:
delay: 0
repeating 0
#1 delay: 0
repeating 1
#2 delay: 0
repeating 2
*/
