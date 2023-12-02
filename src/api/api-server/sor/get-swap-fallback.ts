import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { encodeQuery } from '~/utils';
import { IPool } from '~/types';

interface Queries {
  networkAbbr: string;
  fromTokenId: number;
  toTokenId: number;
}

interface QueryOption extends UseQueryOptions<Response> {}

interface Request {
  queries: Queries;
}
interface Response {
  pool: IPool;
}

const axios = async (queries: Queries) =>
  (await api.get<Response>(`/sor/fallback${encodeQuery(queries)}`)).data;

export const useSorFallbackQuery = (request: Request, options?: QueryOption) => {
  const { queries } = request;

  const queryKey = ['GET', 'SWAP_OPTIMIZED_PATH', queries];
  const data = useQuery<Response>(queryKey, () => axios(queries), options);

  return {
    queryKey,
    ...data,
  };
};
