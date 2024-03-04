import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { encodeQuery } from '~/utils';
import { IRewardsWaveNInfo } from '~/types/rewards';

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

type Response = IRewardsWaveNInfo;

const axios = async (params: Params, queries?: Queries) =>
  (await api.get<Response>(`/reward/${params.networkAbbr}/info-wave-n${encodeQuery(queries)}`))
    .data;

export const useGetRewardsWaveNInfoQuery = (request: Request, options?: QueryOption) => {
  const { params, queries } = request;

  const queryKey = ['GET', 'REWARD', 'INFO', 'WAVEN', params, queries];
  const data = useQuery<Response>(queryKey, () => axios(params, queries), options);

  return {
    queryKey,
    ...data,
  };
};
