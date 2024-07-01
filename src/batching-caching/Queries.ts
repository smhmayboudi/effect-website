import {Effect} from 'effect';
import * as Model from './Model';
import * as Requests from './Requests';
import * as Resolvers from './Resolvers';

// Defines a query to fetch all Todo items
export const getTodos: Effect.Effect<
  Array<Model.Todo>,
  Model.GetTodosError
> = Effect.request(Requests.GetTodos({}), Resolvers.GetTodosResolver);
// Defines a query to fetch a user by their ID
export const getUserById = (id: number) =>
  Effect.request(
    Requests.GetUserById({id}),
    Resolvers.GetUserByIdResolver
  ).pipe(Effect.withRequestCaching(true));
// Defines a query to send an email to a specific address
export const sendEmail = (address: string, text: string) =>
  Effect.request(
    Requests.SendEmail({address, text}),
    Resolvers.SendEmailResolver
  );
// Composes getUserById and sendEmail to send an email to a specific user
export const sendEmailToUser = (id: number, message: string) =>
  getUserById(id).pipe(Effect.andThen(user => sendEmail(user.email, message)));
// Uses getUserById to fetch the owner of a Todo and then sends them an email notification
export const notifyOwner = (todo: Model.Todo) =>
  getUserById(todo.ownerId).pipe(
    Effect.andThen(user =>
      sendEmailToUser(user.id, `hey ${user.name} you got a todo!`)
    )
  );
