import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { encodeQuery } from '~/utils';
import { IToken } from '~/types';

interface Queries {
  symbol?: string;
  networkAbbr?: string;
  address?: string;
  currency?: string;
}
interface QueryOption extends UseQueryOptions<Response> {}

interface Request {
  queries: Queries;
}
interface Response {
  token: IToken;
  metadata: {
    query: Queries;
  };
}

const axios = async (queries: Queries) =>
  (await api.get<Response>(`/token${encodeQuery(queries)}`)).data;

export const useGetTokenQuery = (request: Request, options?: QueryOption) => {
  const { queries } = request;

  const queryKey = ['GET', 'TOKEN', queries];
  const data = useQuery<Response>(queryKey, () => axios(queries), options);

  return {
    queryKey,
    ...data,
  };
};
