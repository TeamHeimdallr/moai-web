import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { encodeQuery } from '~/utils';
import { IPool } from '~/types';

interface Params {
  networkAbbr: string;
}
interface Queries {
  fromTokenId: number;
  toTokenId: number;
}

interface QueryOption extends UseQueryOptions<Response> {}

interface Request {
  params: Params;
  queries: Queries;
}
interface Response {
  pool: IPool;
}

const axios = async (params: Params, queries: Queries) =>
  (await api.get<Response>(`/pool/${params.networkAbbr}/sop${encodeQuery(queries)}`)).data;

export const useGetSwapOptimizedPathQuery = (request: Request, options?: QueryOption) => {
  const { params, queries } = request;

  const queryKey = ['GET', 'SWAP_OPTIMIZED_PATH', params, queries];
  const data = useQuery<Response>(queryKey, () => axios(params, queries), options);

  return {
    queryKey,
    ...data,
  };
};
