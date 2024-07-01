import {Schedule, Effect} from 'effect';

declare const log: <A, Out>(
  action: Effect.Effect<A>,
  schedule: Schedule.Schedule<Out, void>
) => void;

const schedule = Schedule.forever;
const action = Effect.void;
log(action, schedule);
/*
Output:
delay: 0
#1 delay: 0 < forever
#2 delay: 0
#3 delay: 0
#4 delay: 0
#5 delay: 0
#6 delay: 0
#7 delay: 0
#8 delay: 0
#9 delay: 0
...
*/

const schedule2 = Schedule.once;
const action2 = Effect.void;
log(action2, schedule2);
/*
Output:
delay: 0
#1 delay: 0 < once
*/

const schedule3 = Schedule.recurs(5);
const action3 = Effect.void;
log(action3, schedule3);
/*
Output:
delay: 0
#1 delay: 0 < recurs
#2 delay: 0
#3 delay: 0
#4 delay: 0
#5 delay: 0
*/

const schedule4 = Schedule.spaced('200 millis');
const action4 = Effect.delay(Effect.void, '100 millis');
log(action4, schedule4);
/*
Output:
delay: 100
#1 delay: 300 < spaced
#2 delay: 300
#3 delay: 300
#4 delay: 300
#5 delay: 300
#6 delay: 300
#7 delay: 300
#8 delay: 300
#9 delay: 300
...
*/

const schedule5 = Schedule.fixed('200 millis');
const action5 = Effect.delay(Effect.void, '100 millis');
log(action5, schedule5);
/*
Output:
delay: 100
#1 delay: 300 < fixed
#2 delay: 200
#3 delay: 200
#4 delay: 200
#5 delay: 200
#6 delay: 200
#7 delay: 200
#8 delay: 200
#9 delay: 200
...
*/

const schedule6 = Schedule.exponential('10 millis');
const action6 = Effect.void;
log(action6, schedule6);
/*
Output:
delay: 0
#1 delay: 10 < exponential
#2 delay: 20
#3 delay: 40
#4 delay: 80
#5 delay: 160
#6 delay: 320
#7 delay: 640
#8 delay: 1280
#9 delay: 2560
...
*/

const schedule7 = Schedule.fibonacci('10 millis');
const action7 = Effect.void;
log(action7, schedule7);
/*
Output:
delay: 0
#1 delay: 10 < fibonacci
#2 delay: 10
#3 delay: 20
#4 delay: 30
#5 delay: 50
#6 delay: 80
#7 delay: 130
#8 delay: 210
#9 delay: 340
...
*/
