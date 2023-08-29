import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { encodeParams } from '~/utils/params';

import { api } from '..';
import { GetUsersParams, GetUsersResponse } from './types';

/**
 * Get all users
 * GET /users
 */
const getUsersAxios = async (params?: GetUsersParams) =>
  (await api.get<GetUsersResponse>(`/users` + `${encodeParams(params)}`)).data;

export const useGetUsersQuery = (
  params?: GetUsersParams,
  options?: UseQueryOptions<GetUsersResponse>
) =>
  useQuery<GetUsersResponse>(['users', 'get-users', params], () => getUsersAxios(params), {
    keepPreviousData: true,
    ...options,
  });
