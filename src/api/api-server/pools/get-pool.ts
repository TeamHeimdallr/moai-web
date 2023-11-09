import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { IPool } from '~/types';

interface Params {
  networkAbbr: string;
  poolId: string;
}
interface QueryOption extends UseQueryOptions<Response> {}

interface Request {
  params: Params;
}
interface Response {
  pool: IPool;
}

const axios = async (params: Params) =>
  (await api.get<Response>(`/pool/${params.networkAbbr}/${params.poolId}`)).data;

export const useGetPoolQuery = (request: Request, options?: QueryOption) => {
  const { params } = request;

  const queryKey = ['GET', 'POOL', params];
  const data = useQuery<Response>(queryKey, () => axios(params), options);

  return {
    queryKey,
    ...data,
  };
};
