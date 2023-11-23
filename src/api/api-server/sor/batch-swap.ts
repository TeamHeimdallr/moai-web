import { SwapInfo } from '@balancer-labs/sdk';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { encodeQuery } from '~/utils';

interface Queries {
  from: string;
  to: string;
  amount: string; // bigint
}

interface QueryOption extends UseQueryOptions<Response> {}

interface Request {
  queries: Queries;
}
interface Response {
  data: SwapInfo;
}

const axios = async (queries?: Queries) =>
  (await api.get<Response>(`/sor${encodeQuery(queries)}`)).data;

export const useSorQuery = (request: Request, options?: QueryOption) => {
  const { queries } = request;

  const queryKey = ['GET', 'SOR', queries];
  const data = useQuery<Response>(queryKey, () => axios(queries), options);

  return {
    queryKey,
    ...data,
  };
};
