import { useMutation } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { CreateUserRequest } from '~/types';

import { api } from '..';
import { CreateUsersResponse, UseCreateUsersMutationOptions } from './types';

/**
 * Create user
 * POST /users
 */
const createUsersAxios = async (data: CreateUserRequest) =>
  (
    await api.post<CreateUsersResponse, AxiosResponse<CreateUsersResponse>, CreateUserRequest>(
      `/users`,
      data
    )
  ).data;

export const useCreateUsersMutate = (options?: UseCreateUsersMutationOptions) =>
  useMutation<
    CreateUsersResponse,
    AxiosError<CreateUsersResponse, CreateUserRequest>,
    CreateUserRequest
  >(['users', 'create-user'], createUsersAxios, { ...options });
