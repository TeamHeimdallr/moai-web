import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { IMaintanence } from '~/types';

type Response = {
  data: IMaintanence[];
};
interface QueryOption extends UseQueryOptions<Response> {}

const axios = async () => (await api.get<Response>(`/maintanence`)).data;

export const useGetMaintanenceQuery = (options?: QueryOption) => {
  const queryKey = ['GET', 'MAINTANENCE'];
  const data = useQuery<Response>(queryKey, () => axios(), options);

  return {
    queryKey,
    ...data,
  };
};
