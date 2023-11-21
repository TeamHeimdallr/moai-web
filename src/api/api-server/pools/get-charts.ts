import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { api } from '~/api/axios';

import { encodeQuery } from '~/utils';
import { IChartData, POOL_CHART_TYPE } from '~/types';

interface Queries {
  range: string; // '90' | '180' | '365' | 'all';
}
interface Params {
  networkAbbr: string;
  poolId: string;
}

interface QueryOption extends UseQueryOptions<Response> {}

interface Request {
  params: Params;
  queries: Queries;
}
interface Response {
  [POOL_CHART_TYPE.TVL]: IChartData[];
  [POOL_CHART_TYPE.VOLUME]: IChartData[];
  [POOL_CHART_TYPE.FEE]: IChartData[];
  metadata: {
    from: Date;
    to: Date;
    numberOfData: number;
  };
}

const axios = async (params, queries?: Queries) =>
  (
    await api.get<Response>(
      `/pool/${params.networkAbbr}/${params.poolId}/chart${encodeQuery(queries)}`
    )
  ).data;

export const useGetChartQuery = (request: Request, options?: QueryOption) => {
  const { params, queries } = request;

  const queryKey = ['GET', 'CHART', params, queries];
  const data = useQuery<Response>(queryKey, () => axios(params, queries), options);

  return {
    queryKey,
    ...data,
  };
};
