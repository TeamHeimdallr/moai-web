import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { DeleteUsersRequest } from '~/types';

import { api } from '..';
import { DeleteUsersResponse, UseDeleteUsersMutationOptions } from './types';

/**
 * Delete user
 * DELETE /users/:id
 */
const deleteUsersAxios = async (id: number) =>
  (await api.delete<DeleteUsersResponse>(`/users/${id}`)).data;

export const useDeleteUsersMutate = (options?: UseDeleteUsersMutationOptions) =>
  useMutation<
    DeleteUsersResponse,
    AxiosError<DeleteUsersResponse, DeleteUsersRequest>,
    DeleteUsersRequest
  >(['users', 'delete-users'], ({ id }) => deleteUsersAxios(id), {
    ...options,
  });
