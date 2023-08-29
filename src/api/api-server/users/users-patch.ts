import { useMutation } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { UpdateUserRequest } from '~/types';

import { api } from '..';
import { UpdateUsersResponse, UseUpdateUsersMutationOptions } from './types';

/**
 * Update user
 * PATCH /users/:id
 */
const updateUserAxios = async ({ id, ...data }: UpdateUserRequest) =>
  (
    await api.patch<
      UpdateUsersResponse,
      AxiosResponse<UpdateUsersResponse>,
      Omit<UpdateUserRequest, 'id'>
    >(`/users/${id}`, data)
  ).data;

export const usePatchUsersMutate = (options?: UseUpdateUsersMutationOptions) =>
  useMutation<
    UpdateUsersResponse,
    AxiosError<UpdateUsersResponse, UpdateUserRequest>,
    UpdateUserRequest
  >(['users', 'patch-users'], updateUserAxios, { ...options });
