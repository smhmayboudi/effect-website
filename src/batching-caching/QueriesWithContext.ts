import {Effect} from 'effect';
import * as Model from './Model';
import * as Requests from './Requests';
import * as ResolversWithContext from './ResolversWithContext';

export const getTodos = Effect.request(
  Requests.GetTodos({}),
  ResolversWithContext.GetTodosResolver
);
