import { UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { CreateUserRequest, DeleteUsersRequest, UpdateUserRequest, User } from '~/types';
import { PaginationParams } from '~/types/apis';

/**
 * Get all users
 * GET /users
 */
export interface GetUsersParams extends PaginationParams {}
export interface GetUsersResponse {
  data: {
    numUsers: number;
    users: User[];
  };
  message: string;
}

/**
 * Create user
 * POST /users
 */
export interface CreateUsersResponse {
  data: User;
  message: string;
}
export type UseCreateUsersMutationOptions = UseMutationOptions<
  CreateUsersResponse,
  AxiosError<CreateUsersResponse, CreateUserRequest>,
  CreateUserRequest
>;

/**
 * Update user
 * PATCH /users/:id
 */
export interface UpdateUsersResponse {
  data: User;
  message: string;
}
export type UseUpdateUsersMutationOptions = UseMutationOptions<
  UpdateUsersResponse,
  AxiosError<UpdateUsersResponse, UpdateUserRequest>,
  UpdateUserRequest
>;

/**
 * Delete user
 * DELETE /users/:id
 */
export interface DeleteUsersResponse {
  data: User;
  message: string;
}
export type UseDeleteUsersMutationOptions = UseMutationOptions<
  DeleteUsersResponse,
  AxiosError<DeleteUsersResponse, DeleteUsersRequest>,
  DeleteUsersRequest
>;
