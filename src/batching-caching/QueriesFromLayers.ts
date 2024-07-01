import {Effect, Context, Layer, RequestResolver} from 'effect';
import * as API from './API';
import * as Model from './Model';
import * as Requests from './Requests';
import * as ResolversWithContext from './ResolversWithContext';

export class TodosService extends Context.Tag('TodosService')<
  TodosService,
  {
    getTodos: Effect.Effect<Array<Model.Todo>, Model.GetTodosError>;
  }
>() {}
export const TodosServiceLive = Layer.effect(
  TodosService,
  Effect.gen(function* () {
    const http = yield* ResolversWithContext.HttpService;
    const resolver = RequestResolver.fromEffect((request: Requests.GetTodos) =>
      Effect.tryPromise<Array<Model.Todo>, Model.GetTodosError>({
        try: () =>
          http.fetch('https://api.example.demo/todos').then(res => res.json()),
        catch: () => new Model.GetTodosError(),
      })
    );
    return {
      getTodos: Effect.request(Requests.GetTodos({}), resolver),
    };
  })
);
export const getTodos: Effect.Effect<
  Array<Model.Todo>,
  Model.GetTodosError,
  TodosService
> = Effect.andThen(TodosService, service => service.getTodos);
