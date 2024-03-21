import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { IToken } from '~/types';

interface Params {
  networkAbbr: string;
}

interface QueryOption extends UseQueryOptions<Response> {}

interface Request {
  params: Params;
}
interface Response {
  tokens: IToken[];
}

const axios = async (params: Params) =>
  (await api.get<Response>(`/tokens/trending/${params.networkAbbr}`)).data;

export const useGetTrendingTokensQuery = (request: Request, options?: QueryOption) => {
  const { params } = request;

  const queryKey = ['GET', 'TOKENS', 'TRENDING', params];
  const data = useQuery<Response>(queryKey, () => axios(params), options);

  return {
    queryKey,
    ...data,
  };
};
