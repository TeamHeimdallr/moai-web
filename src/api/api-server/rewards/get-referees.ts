import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { encodeQuery } from '~/utils';

interface Queries {
  walletAddress?: string;
  wave?: number;
}
interface Params {
  networkAbbr: string;
}

interface QueryOption extends UseQueryOptions<Response> {}

interface Request {
  params: Params;
  queries: Queries;
}

interface Response {
  referees: number;
}

const axios = async (params: Params, queries?: Queries) =>
  (await api.get<Response>(`/reward/${params.networkAbbr}/referees${encodeQuery(queries)}`)).data;

export const useGetRewardsRefereesQuery = (request: Request, options?: QueryOption) => {
  const { params, queries } = request;

  const queryKey = ['GET', 'REWARD', 'REFEREES', params, queries];
  const data = useQuery<Response>(queryKey, () => axios(params, queries), options);

  return {
    queryKey,
    ...data,
  };
};
