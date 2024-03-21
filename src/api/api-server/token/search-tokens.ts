import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { encodeQuery } from '~/utils';
import { IToken } from '~/types';

interface Params {
  networkAbbr: string;
}
interface Queries {
  text: string;
  lpToken?: boolean;
}

interface QueryOption extends UseQueryOptions<Response> {}

interface Request {
  params: Params;
  queries: Queries;
}
interface Response {
  tokens: IToken[];
}

const axios = async (params: Params, queries?: Queries) =>
  (await api.get<Response>(`/tokens/search/${params.networkAbbr}${encodeQuery(queries)}`)).data;

export const useSearchTokensQuery = (request: Request, options?: QueryOption) => {
  const { params, queries } = request;

  const queryKey = ['GET', 'TOKENS', 'SEARCH', params, queries];
  const data = useQuery<Response>(queryKey, () => axios(params, queries), options);

  return {
    queryKey,
    ...data,
  };
};
