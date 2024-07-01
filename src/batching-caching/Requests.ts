import {Request} from 'effect';
import * as Model from './Model';

// Define a request to get multiple Todo items which might fail with a GetTodosError
export interface GetTodos
  extends Request.Request<Array<Model.Todo>, Model.GetTodosError> {
  readonly _tag: 'GetTodos';
}
// Create a tagged constructor for GetTodos requests
export const GetTodos = Request.tagged<GetTodos>('GetTodos');
// Define a request to fetch a User by ID which might fail with a GetUserError
export interface GetUserById
  extends Request.Request<Model.User, Model.GetUserError> {
  readonly _tag: 'GetUserById';
  readonly id: number;
}
// Create a tagged constructor for GetUserById requests
export const GetUserById = Request.tagged<GetUserById>('GetUserById');
// Define a request to send an email which might fail with a SendEmailError
export interface SendEmail extends Request.Request<void, Model.SendEmailError> {
  readonly _tag: 'SendEmail';
  readonly address: string;
  readonly text: string;
}
// Create a tagged constructor for SendEmail requests
export const SendEmail = Request.tagged<SendEmail>('SendEmail');
// Combine all requests into a union type for easier management
export type ApiRequest = GetTodos | GetUserById | SendEmail;
