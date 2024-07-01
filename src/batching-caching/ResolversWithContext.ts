import {Effect, Context, RequestResolver} from 'effect';
import * as Model from './Model';
import * as Requests from './Requests';

export class HttpService extends Context.Tag('HttpService')<
  HttpService,
  {fetch: typeof fetch}
>() {}
export const GetTodosResolver =
  // we create a normal resolver like we did before
  RequestResolver.fromEffect((request: Requests.GetTodos) =>
    Effect.andThen(HttpService, http =>
      Effect.tryPromise({
        try: () =>
          http
            .fetch('https://api.example.demo/todos')
            .then(res => res.json() as Promise<Array<Model.Todo>>),
        catch: () => new Model.GetTodosError(),
      })
    )
  ).pipe(
    // we list the tags that the resolver can access
    RequestResolver.contextFromServices(HttpService)
  );
